import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SprintAnalysisController } from './sprint-analysis.controller';
import { SprintAnalysisService } from './sprint-analysis.service';

describe('SprintAnalysisController', () => {
  let controller: SprintAnalysisController;
  let sprintAnalysisService: {
    findAll: jest.Mock;
    exportToXlsx: jest.Mock;
  };

  beforeEach(async () => {
    sprintAnalysisService = {
      findAll: jest.fn(),
      exportToXlsx: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintAnalysisController],
      providers: [
        { provide: SprintAnalysisService, useValue: sprintAnalysisService },
      ],
    }).compile();

    controller = module.get(SprintAnalysisController);
  });

  describe('exportToXlsx', () => {
    it('calls SprintAnalysisService.exportToXlsx once', async () => {
      const buffer = Buffer.from('mock-xlsx');
      sprintAnalysisService.exportToXlsx.mockResolvedValue(buffer);

      await controller.exportToXlsx();

      expect(sprintAnalysisService.exportToXlsx).toHaveBeenCalledTimes(1);
    });

    it('returns a StreamableFile with Excel content type and attachment disposition', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-25T15:30:00.000Z'));

      const buffer = Buffer.from('mock-xlsx');
      sprintAnalysisService.exportToXlsx.mockResolvedValue(buffer);

      const result = await controller.exportToXlsx();

      expect(result).toBeInstanceOf(StreamableFile);
      expect(result.options.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(result.options.disposition).toBe(
        'attachment; filename="sprint-analysis-2026-06-25.xlsx"',
      );

      jest.useRealTimers();
    });

    it('propagates service errors', async () => {
      sprintAnalysisService.exportToXlsx.mockRejectedValue(
        new Error('Export failed'),
      );

      await expect(controller.exportToXlsx()).rejects.toThrow('Export failed');
    });
  });
});
