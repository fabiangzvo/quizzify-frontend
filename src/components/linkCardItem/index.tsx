import Link from "next/link";

import { TestBasicInfo } from "@/types/Test";

function LinkCardItem(props: TestBasicInfo) {
  const { id, title, description, total } = props;
  return (
    <li
      key={id}
      className="border border-gray-600 hover:shadow-lg hover:shadow-gray-900 rounded-lg py-10 px-10 m-5 cursor-pointer"
    >
      <Link
        href={`/test/${id}`}
        className="flex items-center space-x-4 rtl:space-x-reverse"
      >
        <div className="flex-1 min-w-0 flex-shrink-0">
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-md truncate">{description}</p>
        </div>
        <div className="inline-flex items-center text-md">
          Total questions:&ensp;{total}
        </div>
      </Link>
    </li>
  );
}

export default LinkCardItem;
