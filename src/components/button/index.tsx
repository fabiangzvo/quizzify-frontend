import { MouseEventHandler, ReactNode, ButtonHTMLAttributes } from "react";
import cs from "classnames";

interface ButtonProps {
  label: string | ReactNode;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
  classes?: string;
  overrideClass?: boolean;
  isDisabled?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
}

function Button(props: ButtonProps) {
  const {
    isDisabled = false,
    handleClick = undefined,
    label,
    classes = "",
    overrideClass = false,
    type = "button",
  } = props;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={cs({
        "text-lg font-medium focus:outline-none rounded-full border border-primary focus:z-10 hover:bg-accent":
          true,
        "max-lg:w-full py-2.5 px-10 me-2 mb-2 bg-primary text-white":
          !overrideClass,
        [classes]: !!classes,
      })}
    >
      {label}
    </button>
  );
}

export default Button;
