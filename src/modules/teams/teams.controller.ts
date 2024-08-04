import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TeamMemberResponseDto } from './dto/team.response.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(SuperAdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new team member' })
  @ApiResponse({
    status: 201,
    description: 'The team member has been successfully created.',
    type: TeamMemberResponseDto,
  })
  create(@Body() createTeamDto: CreateTeamDto): Promise<TeamMemberResponseDto> {
    return this.teamsService.createTeamMember(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiResponse({ status: 200, description: 'Return all team members', type: [TeamMemberResponseDto] })
  findAll(): Promise<TeamMemberResponseDto[]> {
    return this.teamsService.findAllTeamMembers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team member by id' })
  @ApiParam({ name: 'id', description: 'The id of the team member' })
  @ApiResponse({ status: 200, description: 'Return the team member', type: TeamMemberResponseDto })
  findOne(@Param('id') id: string): Promise<TeamMemberResponseDto> {
    return this.teamsService.findOneTeamMember(id);
  }

  @UseGuards(SuperAdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a team member' })
  @ApiParam({ name: 'id', description: 'The id of the team member' })
  @ApiResponse({
    status: 200,
    description: 'The team member has been successfully updated.',
    type: TeamMemberResponseDto,
  })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto): Promise<TeamMemberResponseDto> {
    return this.teamsService.updateTeamMember(id, updateTeamDto);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team member' })
  @ApiParam({ name: 'id', description: 'The id of the team member' })
  @ApiResponse({ status: 200, description: 'The team member has been successfully deleted.' })
  remove(@Param('id') id: string): Promise<{ message: string; status: HttpStatus }> {
    return this.teamsService.removeTeamMember(id);
  }
}
