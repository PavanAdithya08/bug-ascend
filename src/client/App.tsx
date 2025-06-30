import { SpaceShooter } from './components/SpaceShooter';
import WhiteCircle from './assets/bolt-badge/white_circle_360x360/white_circle_360x360.png';
import { navigateTo } from '@devvit/client';

export const App = () => {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <SpaceShooter />
      <div
        className="w-16 h-16 md:w-20 md:h-20 fixed top-4 right-4 z-50 cursor-pointer opacity-80 hover:opacity-100"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            navigateTo('https://bolt.new');
          }
        }}
        onClick={() => navigateTo('https://bolt.new')}
        style={{
          transition: 'opacity 0.2s ease',
        }}
      >
        <img src={WhiteCircle} alt="Bolt Badge" className="w-full h-full object-fit" />
      </div>
    </div>
  );
};
