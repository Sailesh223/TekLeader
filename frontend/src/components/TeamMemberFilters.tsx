import { Box, ToggleButton, ToggleButtonGroup, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FilterList as FilterIcon } from '@mui/icons-material';

interface TeamMemberFiltersProps {
  utilizationFilter: string;
  departmentFilter: string;
  departments: string[];
  onUtilizationFilterChange: (value: string) => void;
  onDepartmentFilterChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export default function TeamMemberFilters({
  utilizationFilter,
  departmentFilter,
  departments,
  onUtilizationFilterChange,
  onDepartmentFilterChange,
  totalCount,
  filteredCount,
}: TeamMemberFiltersProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FilterIcon sx={{ color: '#00897B' }} />
        
        {/* Utilization Filter */}
        <ToggleButtonGroup
          value={utilizationFilter}
          exclusive
          onChange={(_, value) => value && onUtilizationFilterChange(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              borderRadius: 2,
              px: 2,
              '&.Mui-selected': {
                bgcolor: '#00BFA5',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#00897B',
                },
              },
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="utilizing">Utilizing</ToggleButton>
          <ToggleButton value="not-utilizing">Not Utilizing</ToggleButton>
        </ToggleButtonGroup>

        {/* Department Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={departmentFilter}
            label="Department"
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
            sx={{
              borderRadius: 2,
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00BFA5',
              },
            }}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Results Count */}
        <Chip
          label={`Showing ${filteredCount} of ${totalCount} members`}
          sx={{
            bgcolor: '#00BFA520',
            color: '#00897B',
            fontWeight: 600,
            ml: 'auto',
          }}
        />
      </Box>
    </Box>
  );
}

