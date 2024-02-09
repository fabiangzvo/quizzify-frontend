import Link from "next/link";

import { TestBasicInfo } from "@/types/Test";

function LinkCardItem(props: TestBasicInfo) {
  const { id, title, description, total, topic } = props;
  return (
    <li
      key={id}
      className="border border-gray-600 hover:shadow-lg hover:shadow-gray-900 rounded-lg p-10 m-5 cursor-pointer max-lg:p-4"
    >
      <Link
        href={`/test/${id}`}
        className="flex items-center space-x-4 rtl:space-x-reverse max-lg:flex-col mac-lg:items-center"
      >
        <div className="flex-1 min-w-0 flex-shrink-0 max-lg:justify-center max-lg:text-center">
          <h1 className="text-xl font-bold max-lg:w-full ">
            {title}&ensp;
            <span className="bg-[#F05D5E] text-lg font-medium me-2 px-2.5 py-0.5 rounded">
              {topic}
            </span>
          </h1>
          <p className="text-lg mt-5 text-gray-400 mr-10 max-lg:w-full">
            {description}
          </p>
        </div>
        <div className="inline-flex items-center text-lg font-semibold max-lg:text-center max-lg:mt-5">
          Questions:&ensp;{total}
        </div>
      </Link>
    </li>
  );
}

export default LinkCardItem;
