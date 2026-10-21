// The GitHub repository cutshort releases are published to. Update checks and
// desktop auto-update read only from here; set it to null to turn them off.
// Never point it at a repository you do not control: its owner could ship
// installers to every cutshort user. config/electron-builder.config.mjs must
// publish to the same repository (desktop/update-packaging.verify.ts checks it).
export const RELEASE_REPOSITORY: { readonly owner: string; readonly repo: string } | null = {
  owner: 'nayanparakh',
  repo: 'cutshort',
};

/** cutshort's own source repository. */
export const PROJECT_REPOSITORY_URL = 'https://github.com/nayanparakh/cutshort';
