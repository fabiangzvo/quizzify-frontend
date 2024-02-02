import { ListItemProps } from "../../types";

function ResumeItem(props: ListItemProps) {
  const { label, value } = props;
  return (
    <li className="m-10">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium">{label}</p>
        </div>
        <div className="inline-flex items-center font-semibold text-lg">
          {value}
        </div>
      </div>
    </li>
  );
}

export default ResumeItem;
