/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionFunction,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
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

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
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
            "flex gap-8 overflow-x-auto mt-4",
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
  const deleteFetcher = useFetcher();
  const changeShelfNameFetcher = useFetcher();
  const createShelfItemFetcher = useFetcher();
  const isDeletingShelf =
    deleteFetcher.formData?.get("action") == "deleteShelf" &&
    deleteFetcher.formData?.get("deleteId") == shelf.id;

  return isDeletingShelf ? null : (
    <li
      className={classNames(
        "border-2 border-black rounded-md p-4",
        "w-[calc(100vw-2rem)] flex-none snap-center mb-2",
        "md:w-96 "
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

        <deleteFetcher.Form method="post">
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
        </deleteFetcher.Form>
      </div>
      <createShelfItemFetcher.Form method="post" className="">
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
        {shelf.items.map((item: any) => {
          return (
            <li className="mt-4 text-lg font-semibold" key={item.id}>
              <div className="flex justify-between items-center px-4">
                <div>{item.name}</div>
                <Form method="post">
                  <button type="submit" name="action" value="deleteShelfItem">
                    <MdDeleteOutline className="text-xl" />
                  </button>
                  <input
                    hidden
                    type="text"
                    defaultValue={item.id}
                    name="itemId"
                  />
                </Form>
              </div>
            </li>
          );
        })}
      </ul>
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
