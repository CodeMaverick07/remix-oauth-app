/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionFunction,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useNavigation,
  useFetcher,
  useRouteError,
} from "@remix-run/react";

import {
  changeShelfName,
  createShelves,
  deleteShelve,
  getAllShelves,
} from "~/model/pantry-shelf.server";
import classNames from "classnames";
import { CiSearch } from "react-icons/ci";

import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

import { MdDeleteOutline } from "react-icons/md";
import { string, z } from "zod";
import { validateForm } from "~/utils/validation";
import { createShelfItem, deleteShelfItem } from "~/model/pantry-item.server";
import React from "react";
import { useServerLayoutEffect } from "~/lib/utils";
import { sessionStorage } from "~/lib/session.server";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  console.log(session.get("userId"));

  const url = new URL(request.url).searchParams.get("q");
  const shelves = await getAllShelves(url);
  return json({ shelves });
};

const createShelfItemSchema = z.object({
  shelfId: z.string(),
  itemName: z.string().min(1, "Item name is too short"),
});
const deleteShelfSchema = z.object({
  deleteId: z.string(),
});
const changeShelfNameSchema = z.object({
  name: string(),
  shelfId: string(),
});
const deleteShelfItemSchema = z.object({
  itemId: z.string(),
});
export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const action = data.get("action");
  console.log(action);

  switch (action) {
    case "createShelf": {
      const data = await createShelves({ name: "new shelve" });
      return json(data);
    }
    case "deleteShelf": {
      return validateForm(
        data,
        deleteShelfSchema,
        (data) => deleteShelve(data.deleteId),
        (errors) => json({ errors })
      );
    }
    case "changeShelfName": {
      return await validateForm(
        data,
        changeShelfNameSchema,
        (data) => {
          return changeShelfName(data.shelfId, data.name);
        },
        (errors) => {
          console.log(errors);
          return json({ errors });
        }
      );
    }
    case "createShelfItem": {
      return validateForm(
        data,
        createShelfItemSchema,
        (data) => createShelfItem(data.shelfId, data.itemName),
        (errors) => {
          console.log(errors);
          return json({ errors }, { status: 400 });
        }
      );
    }
    case "deleteShelfItem": {
      return validateForm(
        data,
        deleteShelfItemSchema,
        (data) => deleteShelfItem(data.itemId),
        (errors) => json({ errors })
      );
    }
  }
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  // Check the commit process and log the result

  const navigation = useNavigation();
  const isSearching = navigation.formData?.has("q");
  const createShelfFetcher = useFetcher();
  const isCreatingShelf =
    createShelfFetcher.formData?.get("action") == "createShelf";

  return (
    <div className="w-full">
      <Form
        className={classNames(
          "flex border-2 border-gray-300 rounded-md mt-2",
          "focus-within:border-blue-600 w-full md:w-96"
        )}
      >
        <button className="px-2">
          <CiSearch />
        </button>
        <input
          type="text"
          name="q"
          autoComplete="off"
          placeholder="search Shelves..."
          className="py-3 outline-none bg-white"
        />
      </Form>
      <createShelfFetcher.Form method="post">
        <Button
          name="action"
          value="createShelf"
          className="mt-4 max-md:w-full"
          type="submit"
          disabled={isCreatingShelf}
          variant={"primary"}
        >
          {isCreatingShelf ? "creating...." : "create shelf"}
        </Button>
      </createShelfFetcher.Form>
      {isSearching ? (
        <div className="flex max-md:flex-col h-96 w-screen gap-8 mt-4">
          <Skeleton className="w-80 h-24" />
          <Skeleton className="w-80 h-24" />
          <Skeleton className="w-80 h-24 max-md:hidden" />
          <Skeleton className="w-80 h-24 max-md:hidden" />
        </div>
      ) : (
        <ul
          className={classNames(
            "flex items-start gap-8 overflow-x-auto mt-4",
            "snap-x snap-mandatory md:snap-none"
          )}
        >
          {data.shelves.map((shelf: any) => {
            return <Shelf key={shelf.id} shelf={shelf} />;
          })}
        </ul>
      )}
    </div>
  );
};

export default Pantry;

interface shelfProps {
  shelf: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
    }[];
  };
}

function Shelf({ shelf }: shelfProps) {
  const deleteShelfFetcher = useFetcher();
  const changeShelfNameFetcher = useFetcher();
  const createShelfItemFetcher = useFetcher();
  const { renderedItems, addItem } = useOptimisticItems(
    shelf.items,
    createShelfItemFetcher.state
  );
  const isDeletingShelf =
    deleteShelfFetcher.formData?.get("action") == "deleteShelf" &&
    deleteShelfFetcher.formData?.get("deleteId") == shelf.id;

  return isDeletingShelf ? null : (
    <li
      className={classNames(
        "border-2 border-black rounded-md p-4 h-auto",
        "w-[calc(100vw-2rem)] flex-none snap-center mb-2",
        "md:w-96"
      )}
      key={shelf.id}
    >
      <div className="flex justify-between">
        <changeShelfNameFetcher.Form method="post">
          <input
            defaultValue={shelf.name}
            placeholder="shelf name"
            name="name"
            autoComplete="off"
            className="text-2xl font-extrabold mb-2 w-full outline-none border-b-2 bg-white border-b-white focus:border-black"
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (e.target.value.trim() !== "") {
                  e.target.blur();
                  e.target.form.requestSubmit();
                }
              }
            }}
            onBlur={(e: any) => {
              if (e.target.value.trim() === "") {
                e.target.value = shelf.name;
              } else {
                e.target.form.requestSubmit();
              }
            }}
          />
          <input type="hidden" value="changeShelfName" name="action" />
          <input type="text" hidden defaultValue={shelf.id} name="shelfId" />
        </changeShelfNameFetcher.Form>

        <deleteShelfFetcher.Form
          method="post"
          onSubmit={(event: any) => {
            if (!confirm("are you sure you want to delete this shelf?")) {
              event.preventDefault();
            }
          }}
        >
          <input type="text" hidden defaultValue={shelf.id} name="deleteId" />
          <button
            disabled={isDeletingShelf}
            type="submit"
            name="action"
            value={"deleteShelf"}
            className="text-red-600 text-xs font-bold"
          >
            <MdDeleteOutline className="text-3xl text-red-600" />
          </button>
        </deleteShelfFetcher.Form>
      </div>
      <createShelfItemFetcher.Form
        method="post"
        className=""
        onSubmit={(event) => {
          const target = event.target as HTMLFormElement;
          const itemNameInput = target.elements.namedItem(
            "itemName"
          ) as HTMLInputElement;
          addItem(itemNameInput.value);
        }}
      >
        <input
          name="itemName"
          type="text"
          placeholder="add item"
          className="w-full p-2  border-b-2 outline-none focus:border-black"
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.target.form.requestSubmit();
              e.target.value = "";
            }
          }}
          onBlur={(e: any) => {
            e.target.form.requestSubmit();
          }}
        />
        <input type="hidden" name="shelfId" defaultValue={shelf.id} />
        <input type="hidden" value="createShelfItem" name="action" />
      </createShelfItemFetcher.Form>

      <ul>
        {renderedItems.map((item: any) => {
          return <ShelfItem item={item} key={item.id} />;
        })}
      </ul>
    </li>
  );
}

function ShelfItem(item: any) {
  const deleteShelfItemFetcher = useFetcher();
  const isDeleteingShelfItem = !!deleteShelfItemFetcher.formData;
  return isDeleteingShelfItem ? null : (
    <li className="mt-4 text-lg font-semibold">
      <div className="flex justify-between items-center px-4">
        <div>{item.item.name}</div>
        {item.item.isOptimistic ? (
          <div></div>
        ) : (
          <deleteShelfItemFetcher.Form method="post">
            <button type="submit" name="action" value="deleteShelfItem">
              <MdDeleteOutline className="text-xl" />
            </button>
            <input
              hidden
              type="text"
              defaultValue={item.item.id}
              name="itemId"
            />
          </deleteShelfItemFetcher.Form>
        )}
      </div>
    </li>
  );
}

export const ErrorBoundary = () => {
  const error: any = useRouteError();
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <h1 className=" font-bold text-5xl text-red-700">
        {error?.status} {error?.statusText}
      </h1>
    </div>
  );
};

type RenderedItem = {
  name: string;
  id: string;
  isOptimistic?: boolean;
};

function useOptimisticItems(
  savedItems: Array<RenderedItem>,
  createShelfItemState: "idle" | "submitting" | "loading"
) {
  const [optimisticItems, setOptimisticItems] = React.useState<
    Array<RenderedItem>
  >([]);

  const renderedItems = [...optimisticItems, ...savedItems];
  renderedItems.sort((a, b) => {
    if (a.name == b.name) return 0;
    return a.name < b.name ? -1 : 1;
  });

  useServerLayoutEffect(() => {
    if (createShelfItemState == "idle") {
      setOptimisticItems([]);
    }
  }, [createShelfItemState]);

  const addItem = (name: string) => {
    if (name == "") {
      return;
    }
    setOptimisticItems((items) => [
      ...items,
      { name: name, id: createItemId(), isOptimistic: true },
    ]);
  };
  return { addItem, renderedItems };
}

function createItemId() {
  return `${Math.round(Math.random() * 1_000_000)}`;
}
