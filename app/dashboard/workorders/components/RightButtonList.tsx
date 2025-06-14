import { Button } from "@heroui/button";
import { Filter, Plus, Search } from "lucide-react";

export default function WoRightButtonList() {
  return (
    <>
      <Button
        className="flex-1 sm:flex-initial"
        color="default"
        size="sm"
        startContent={<Filter className="w-4 h-4" />}
        variant="flat"
      >
        Filter
      </Button>
      <Button
        className="flex-1 sm:flex-initial"
        color="default"
        size="sm"
        startContent={<Search className="w-4 h-4" />}
        variant="flat"
      >
        Search
      </Button>
      <Button
        className="flex-1 sm:flex-initial"
        color="primary"
        size="sm"
        startContent={<Plus className="w-4 h-4" />}
      >
        New Order
      </Button>
    </>
  );
}
