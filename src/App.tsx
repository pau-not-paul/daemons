import { useState } from 'react'
import { ConfigurationModal } from './components/modals/ConfigurationModal';
import { Editor } from './components/Editor';

export default () => {
  const [configModalOpen, setConfigModalOpen] = useState(true);

  return (
    <>
      <ConfigurationModal visible={configModalOpen} setVisible={setConfigModalOpen} />
      <Editor configModalOpen={configModalOpen} setConfigModalOpen={setConfigModalOpen} />
      <Footer />
      <DoesNotWorkOnMobileWarning />
    </>
  );
}

const Footer = () => (
  <div className='text-center text-gray-500 text-sm p-4'>
    <a className='ml-1 underline hover:text-gray-700' href='https://maggieappleton.com/lm-sketchbook#daemons'>
      https://maggieappleton.com/lm-sketchbook#daemons
    </a>
  </div>
);

const DoesNotWorkOnMobileWarning = () => (
  <div className='md:hidden fixed w-full h-full top-0 left-0 right-0 bottom-0 bg-white z-50 nice-gradient'>
    <div className='flex justify-center items-center h-full'>
      Sorry, it doesn't work on mobile.
    </div>
  </div>
);
