import Link from 'next/link';
import { demoUrl, docsRoute, githubUrl, packageVersion } from '@/lib/shared';
import { ExtIcon } from './icons';
import { drawingNo, pad2, sheetCount } from './sheets';

/** The end-of-set strip, like the portfolio's footer. */
export function HomeFooter() {
  return (
    <footer className="foot" data-home-foot="">
      <div className="wrap foot__inner">
        <p className="foot__id">
          Mesh · {drawingNo} · Rev {packageVersion} · MIT
        </p>
        <ul className="foot__links">
          <li>
            <Link className="link link--mono" href={docsRoute}>
              Docs
            </Link>
          </li>
          <li>
            <a className="link link--mono" href={demoUrl} target="_blank" rel="noreferrer">
              Demo
              <ExtIcon className="link__ext" />
            </a>
          </li>
          <li>
            <a className="link link--mono" href={githubUrl} target="_blank" rel="noreferrer">
              GitHub
              <ExtIcon className="link__ext" />
            </a>
          </li>
          <li>
            <a
              className="link link--mono"
              href={`${githubUrl}/blob/main/CHANGELOG.md`}
              target="_blank"
              rel="noreferrer"
            >
              Changelog
              <ExtIcon className="link__ext" />
            </a>
          </li>
        </ul>
        <p className="foot__by">
          Sheet {pad2(sheetCount)} of {pad2(sheetCount)} · End of set · Drawn by{' '}
          <a className="link" href="https://ebarlow.dev" target="_blank" rel="noreferrer">
            Ethan Barlow
          </a>
        </p>
      </div>
    </footer>
  );
}
