import { useRef, useState } from 'react';
import { initializeOpenAIClient, setOpenAIConfig } from '../../utils/openAIUtils';
import { NoAPIKeyModal } from './NoAPIKeyModal';
// @ts-ignore
import NiceRobotImg from '../../assets/images/nice_robot.png';

const modelOptions = [
  { label: 'Cheap', value: 'gpt-4o-mini' },
  { label: 'Best', value: 'gpt-4o' }
];

const ConnectingStates = {
  'INITIAL': 'INITIAL',
  'CONNECTING': 'CONNECTING',
  'CONNECTED': 'CONNECTED',
};

export const ConfigurationModal = (
  { visible, setVisible }:
    { visible: boolean, setVisible: (visible: boolean) => void }
) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [model, setModel] = useState('gpt-4o-mini');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState(null);
  const [connectingState, setConnectingState] = useState(ConnectingStates.INITIAL);
  const [shownoAPIKeyModal, setShownoAPIKeyModal] = useState(false);

  if (!visible) return null;

  if (shownoAPIKeyModal) {
    return (
      <NoAPIKeyModal
        goBack={() => setShownoAPIKeyModal(false)}
        skipConfigStep={() => {
          setVisible(false);
          setShownoAPIKeyModal(false);
        }}
      />
    )
  }

  const handleConnect = async ({ lastApiKey }: { lastApiKey: string }) => {
    setOpenAIConfig({ model, apiKey: lastApiKey });
    try {
      setConnectingState(ConnectingStates.CONNECTING);
      await initializeOpenAIClient();
      setConnectingState(ConnectingStates.CONNECTED);
      setTimeout(() => setVisible(false), 2000);
    } catch (e: Error | any) {
      setApiKeyError('message' in e && e.message);
      setConnectingState(ConnectingStates.INITIAL);
    }
  };

  return (
    <div
      className='absolute flex flex-row top-0 left-0 w-full h-full z-20 justify-center items-center bg-black/70'
      onClick={(e) => {
        if (modalRef.current?.contains(e.target as Node)) return;
        if (connectingState === ConnectingStates.INITIAL) {
          setShownoAPIKeyModal(true)
        }
      }}
    >
      <div className='bg-white w-[400px] min-h-[300px] rounded-lg p-6 relative overflow-hidden' ref={modalRef}>
        <img src={NiceRobotImg} className='hidden' /> {/* To preload the img */}
        {connectingState !== ConnectingStates.INITIAL ? (
          <div className='absolute inset-0 flex items-center justify-center transition-opacity duration-1000 opacity-0 animate-fadeIn'>
            <img src={NiceRobotImg} alt='Hello' className='max-w-full max-h-full object-contain' />
          </div>
        ) : (
          <>
            <div className='text-lg font-semibold w-[360px]'>Configuration</div>
            <div className='mt-6 text-gray-700'>
              Model
            </div>
            <div className='flex justify-center gap-4 w-full max-w-md mx-auto mt-1'>
              {modelOptions.map(option => (
                <button
                  key={option.value}
                  className={`flex-1 border border-gray-300 rounded-lg shadow-sm transition-shadow duration-100 p-3 focus:outline-none ${model === option.value ? '!border-black' : 'hover:border-gray-400'}`}
                  onClick={() => setModel(option.value)}
                >
                  <div className='font-medium mb-1'>{option.label}</div>
                  <div className='text-sm text-gray-600'>{option.value}</div>
                </button>
              ))}
            </div>
            <div className='mt-6 text-gray-700'>
              OpenAI API Key
            </div>
            <input
              className='w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:border-gray-900 mt-1'
              placeholder='sk-....'
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeyError(null);
              }}
              value={apiKey}
              onPaste={async (e) =>
                handleConnect({ lastApiKey: e.clipboardData.getData('Text') })
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  if (apiKey.length === 0) {
                    setShownoAPIKeyModal(true);
                    return;
                  }
                  handleConnect({ lastApiKey: apiKey });
                }
              }}
            />
            {(apiKeyError || (apiKey.length >= 3 && !apiKey.startsWith('sk-'))) && (
              <div className='text-red-500 text-sm mt-1 overflow-x-hidden'>
                {(apiKeyError && limitAsterisks(apiKeyError)) || `Invalid API key. It should start with 'sk-'.`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const limitAsterisks = (string: string) => string.replace(/\*{6,}/g, '*****');
