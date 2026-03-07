import { TeamMember } from '../api/client';

export const exportTeamMembersToCSV = (teamMembers: TeamMember[], managerName: string) => {
  // Prepare CSV headers
  const headers = ['Name', 'Department', '1:1s Participated', '1:1s Set Up', 'Participation Rate', 'Status'];
  
  // Prepare CSV rows
  const rows = teamMembers.map((member) => {
    const participationRate = member.oneOnOnesSetUp > 0
      ? ((member.oneOnOnesCount / member.oneOnOnesSetUp) * 100).toFixed(1)
      : '0.0';
    
    return [
      member.name,
      member.department,
      member.oneOnOnesCount.toString(),
      member.oneOnOnesSetUp.toString(),
      `${participationRate}%`,
      member.isUtilizing ? 'Utilizing' : 'Not Utilizing',
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${managerName.replace(/\s+/g, '_')}_Team_Members.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

