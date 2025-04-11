interface Props{
  isDarkMode: boolean;
}

const ThemeToggleSwitchIcon: React.FC<Props> = ({ isDarkMode }: Props) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="6" className={isDarkMode ? 'switch-track-dark' : 'switch-track'} />
      <circle cx={isDarkMode ? "16" : "8"} cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

export default ThemeToggleSwitchIcon;
