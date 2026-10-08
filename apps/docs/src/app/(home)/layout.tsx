import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Masthead } from '@/components/home/masthead';
import { HomeShell } from '@/components/home/shell';
import './home.css';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout {...baseOptions()} slots={{ header: Masthead, container: HomeShell }}>
      {children}
    </HomeLayout>
  );
}
