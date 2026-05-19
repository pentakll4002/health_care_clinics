import { Outlet } from 'react-router-dom';
import Header from '../ui/Header';
import Sidebar from '../ui/Sidebar';
import ChatbotWidget from '../ui/ChatbotWidget';
import PageTransition from '../ui/PageTransition';
import useDarkMode from '../hooks/useDarkMode';

const LayoutApp = () => {
  // Initialize dark mode on mount
  useDarkMode();

  return (
    <div className='h-screen w-full grid grid-cols-[280px_1fr]'>
      <aside
        className='h-full overflow-y-hidden border-r'
        style={{
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)',
        }}
      >
        <Sidebar />
      </aside>

      <div className='flex flex-col h-full'>
        <Header />

        <main
          className='flex-1 overflow-y-auto relative'
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <ChatbotWidget />
      </div>
    </div>
  );
};

export default LayoutApp;
