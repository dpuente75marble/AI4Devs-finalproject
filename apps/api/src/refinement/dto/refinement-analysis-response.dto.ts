import { ApiProperty } from '@nestjs/swagger';

export class RefinementAnalysisResponseDto {
  @ApiProperty({
    example:
      'Business requirement extracted from uploaded PDF:\nrequirement.pdf\n\nThe system must support sprint planning workflows.',
    description: 'Text extracted from the uploaded PDF',
  })
  sourceText!: string;

  @ApiProperty({
    example:
      'As a Tech Lead, I want sprint planning workflows so that the team can deliver predictably.',
    description: 'Refined user story generated from the requirement',
  })
  refinedStory!: string;

  @ApiProperty({
    type: [String],
    example: [
      'Given sprint planning workflows When refinement runs Then a refined user story is generated',
      'Given extracted requirement content When acceptance criteria are produced Then each criterion follows Given/When/Then format',
    ],
    description: 'Generated acceptance criteria in Given/When/Then format',
  })
  acceptanceCriteria!: string[];

  @ApiProperty({
    type: [String],
    example: ['Missing business rule for error handling and failure scenarios'],
    description: 'Identified gaps, ambiguities, or missing information',
  })
  gaps!: string[];

  @ApiProperty({
    example: 'mock',
    description: 'Refinement provider identifier',
  })
  provider!: string;
}
