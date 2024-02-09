import { useMemo } from "react";

import { ListItemProps } from "../../types";
import ResumeItem from "../resumeItem";

interface ResumeListProps {
  items: Array<ListItemProps>;
}

function ResumeList(props: ResumeListProps) {
  const { items } = props;

  const list = useMemo(
    () => items.map((item, i) => <ResumeItem key={i} {...item} />),
    [items]
  );

  return <ul className="w-4/6 max-lg:w-full">{list}</ul>;
}

export default ResumeList;
