import { Loader } from "@components/loader";
import Button from "@components/button";

interface SubmitButtonProps {
  isLoading?: boolean;
  label: string;
}

function SubmitButton(props: SubmitButtonProps): JSX.Element {
  const { label, isLoading } = props;

  return (
    <div className="w-full flex justify-center">
      <Button
        isDisabled={isLoading}
        type="submit"
        classes="max-md:w-3/4 w-2/4"
        label={isLoading ? <Loader className="h-7 w-7 " /> : label}
      />
    </div>
  );
}

export default SubmitButton;
