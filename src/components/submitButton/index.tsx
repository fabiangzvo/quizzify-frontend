import { Loader } from "@components/loader";

interface SubmitButtonProps {
  isLoading?: boolean;
  label: string;
}

function SubmitButton(props: SubmitButtonProps): JSX.Element {
  const { label, isLoading } = props;

  return (
    <div className="w-full flex justify-center">
      <button
        disabled={isLoading}
        type="submit"
        className="w-2/4 py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
      >
        {isLoading ? <Loader className="h-7 w-7" /> : label}
      </button>
    </div>
  );
}

export default SubmitButton;
