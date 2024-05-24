export const NoAPIKeyModal = (
  { goBack, skipConfigStep }:
    { goBack: () => void, skipConfigStep: () => void }
) => {
  return (
    <div className='absolute flex flex-row top-0 left-0 w-full h-full z-20 justify-center items-center bg-black/70'>
      <div className='bg-white w-[400px] rounded-lg p-6 relative overflow-hidden'>
        <div className='text-lg font-semibold w-[360px]'>
          API key required
        </div>
        <div className='mt-4 text-gray-700'>
          Without an API key, you can access the text editor, but the AI assistants won't be available.
        </div>
        <div className='flex justify-between gap-4 w-full max-w-md mx-auto mt-4'>
          <button
            onClick={() => skipConfigStep()}
            className='mt-4 py-2 px-2 underline text-gray-700 hover:text-black'
          >
            Open editor anyway
          </button>
          <button
            onClick={() => goBack()}
            className='mt-4 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:border-gray-900 hover:bg-gray-50'
          >
            Add API key
          </button>
        </div>
      </div>
    </div>
  );
}
