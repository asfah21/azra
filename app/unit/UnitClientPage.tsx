"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Avatar,
  Input,
} from "@heroui/react";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { SearchIcon } from "lucide-react";

export const animals = [
  {
    label: "Cat",
    key: "cat",
    description: "The second most popular pet in the world",
  },
  {
    label: "Dog",
    key: "dog",
    description: "The most popular pet in the world",
  },
  {
    label: "Elephant",
    key: "elephant",
    description: "The largest land animal",
  },
  { label: "Lion", key: "lion", description: "The king of the jungle" },
  { label: "Tiger", key: "tiger", description: "The largest cat species" },
  { label: "Giraffe", key: "giraffe", description: "The tallest land animal" },
];

export default function UnitPages() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const users = [
    {
      id: 1,
      name: "Tony Reichert",
      role: "CEO",
      team: "Management",
      status: "active",
      age: "29",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
      email: "tony.reichert@example.com",
    },
    {
      id: 2,
      name: "Zoey Lang",
      role: "Tech Lead",
      team: "Development",
      status: "paused",
      age: "25",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png",
      email: "zoey.lang@example.com",
    },
    {
      id: 3,
      name: "Jane Fisher",
      role: "Sr. Dev",
      team: "Development",
      status: "active",
      age: "22",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png",
      email: "jane.fisher@example.com",
    },
    {
      id: 4,
      name: "William Howard",
      role: "C.M.",
      team: "Marketing",
      status: "vacation",
      age: "28",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/2.png",
      email: "william.howard@example.com",
    },
    {
      id: 5,
      name: "Kristen Copper",
      role: "S. Manager",
      team: "Sales",
      status: "active",
      age: "24",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/3.png",
      email: "kristen.cooper@example.com",
    },
    {
      id: 6,
      name: "Brian Kim",
      role: "P. Manager",
      team: "Management",
      age: "29",
      avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/3.png",
      email: "brian.kim@example.com",
      status: "active",
    },
  ];

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
      <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Modal Title
              </ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input
                    label="Email"
                    style={{ outline: "none" }}
                    type="email"
                    onFocus={(e) => (e.target.style.outline = "none")}
                  />
                </div>

                <Autocomplete
                  className="max-w-xs border-none"
                  defaultItems={animals}
                  defaultSelectedKey="cat"
                  label="Favorite Animal"
                  labelPlacement="outside-top"
                  listboxProps={{
                    hideSelectedIcon: true,
                    itemClasses: {
                      base: [
                        "rounded-medium",
                        "text-default-500",
                        "transition-opacity",
                        "data-[hover=true]:text-foreground",
                        "dark:data-[hover=true]:bg-default-50",
                        "data-[pressed=true]:opacity-70",
                        "data-[hover=true]:bg-default-200",
                        "data-[selectable=true]:focus:bg-default-100",
                        "data-[focus-visible=true]:ring-default-500",
                      ],
                    },
                  }}
                  placeholder="Search an animal"
                  popoverProps={{
                    offset: 10,
                    classNames: {
                      base: "rounded-large",
                      content:
                        "p-1 border-small border-default-100 bg-background",
                    },
                  }}
                  style={{ outline: "none" }}
                  variant="bordered"
                  onFocus={(e) => (e.target.style.outline = "none")}
                >
                  {(item) => (
                    <AutocompleteItem key={item.key} variant="flat">
                      {item.label}
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <Autocomplete
                  aria-label="Select an employee"
                  classNames={{
                    base: "max-w-xs",
                    listboxWrapper: "max-h-[320px]",
                    selectorButton: "text-default-500",
                  }}
                  defaultItems={users}
                  inputProps={{
                    variant: "underlined",
                    classNames: {
                      input: "ml-1",
                      inputWrapper: "h-[48px]",
                    },
                  }}
                  listboxProps={{
                    hideSelectedIcon: true,
                    itemClasses: {
                      base: [
                        "rounded-medium",
                        "text-default-500",
                        "transition-opacity",
                        "data-[hover=true]:text-foreground",
                        "dark:data-[hover=true]:bg-default-50",
                        "data-[pressed=true]:opacity-70",
                        "data-[hover=true]:bg-default-200",
                        "data-[selectable=true]:focus:bg-default-100",
                        "data-[focus-visible=true]:ring-default-500",
                      ],
                    },
                  }}
                  placeholder="Enter employee name"
                  popoverProps={{
                    offset: 10,
                    classNames: {
                      base: "rounded-large",
                      content: "p-1 border-none bg-background",
                    },
                  }}
                  radius="full"
                  startContent={
                    <SearchIcon
                      className="text-default-400"
                      size={20}
                      strokeWidth={2.5}
                    />
                  }
                  variant="bordered"
                >
                  {(item) => (
                    <AutocompleteItem key={item.id} textValue={item.name}>
                      <div className="flex justify-between items-center border-none">
                        <div className="flex gap-2 items-center">
                          <Avatar
                            alt={item.name}
                            className="shrink-0"
                            size="sm"
                            src={item.avatar}
                          />
                          <div className="flex flex-col">
                            <span className="text-small">{item.name}</span>
                            <span className="text-tiny text-default-400">
                              {item.team}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="border-none mr-0.5 font-medium shadow-small"
                          radius="full"
                          size="sm"
                          variant="bordered"
                        >
                          Add
                        </Button>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Nullam pulvinar risus non risus hendrerit venenatis.
                  Pellentesque sit amet hendrerit risus, sed porttitor quam.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
