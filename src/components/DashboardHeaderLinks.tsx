import type { CSSProperties } from 'react';
import { useT } from '../i18n/locale';
import { theme } from '../theme';
import { Icon } from './icons';
import { PROJECT_REPOSITORY_URL } from '../../shared/release-repository';

// GitHub link to cutshort's source (AGPL-3.0-or-later requires offering it).
export function DashboardHeaderLinks() {
  const t = useT();
  return (
    <span style={linkGroup}>
      <a
        href={PROJECT_REPOSITORY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('GitHub 仓库')}
        data-tip={t('GitHub 仓库')}
        data-cc-titlebar-control="true"
        className="cc-header-btn cc-tip cc-tip-r"
        style={githubLink}
      >
        <Icon name="github" size={16} />
      </a>
    </span>
  );
}

const linkGroup: CSSProperties = {
  position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 2,
};
const githubLink: CSSProperties = {
  background: 'none', border: 'none', color: theme.textDim, cursor: 'pointer', padding: 6,
  borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none',
};
