import { Button } from "@heroui/button";
import { Filter, Search, UserPlus } from "lucide-react";

export default function RightButtonList() {
  return (
    <>
      <Button
        color="default"
        size="sm"
        startContent={<Filter className="w-4 h-4" />}
        variant="flat"
      >
        Filter
      </Button>
      <Button
        color="default"
        size="sm"
        startContent={<Search className="w-4 h-4" />}
        variant="flat"
      >
        Search
      </Button>
      <Button
        color="primary"
        size="sm"
        startContent={<UserPlus className="w-4 h-4" />}
      >
        Add User
      </Button>
    </>
  );
}
