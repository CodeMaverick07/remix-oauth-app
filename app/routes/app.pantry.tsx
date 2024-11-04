/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionFunction,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";

import {
  createShelves,
  deleteShelve,
  getAllShelves,
} from "~/model/pantry-shelf.server";
import classNames from "classnames";
import { CiSearch } from "react-icons/ci";

import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";

import { MdDeleteOutline } from "react-icons/md";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url).searchParams.get("q");
  const shelves = await getAllShelves(url);
  return json({ shelves });
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const action = data.get("action");

  switch (action) {
    case "createShelf": {
      const data = createShelves({ name: "new shelve" });
      return json(data);
    }
    case "deleteShelf": {
      const deleteId = data.get("deleteId") as string;
      console.log("form the inside of action", deleteId);
      const res = deleteShelve({ id: deleteId });
      return json(res);
    }
  }
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSearching = navigation.formData?.has("q");
  const isCreatingShelf = navigation.formData?.get("action") == "createShelf";
  const isDeletingShelf = navigation.formData?.get("action") == "deleteShelf";
  return (
    <div className="">
      <Form
        className={classNames(
          "flex border-2 border-gray-300 rounded-md mt-2",
          "focus-within:border-blue-600"
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
          className="w-full py-3 outline-none bg-white"
        />
      </Form>
      <Form method="post">
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
      </Form>
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
            return (
              <li
                className={classNames(
                  "border-2 border-black rounded-md p-4",
                  "w-[calc(100vw-2rem)] flex-none snap-center mb-2",
                  "md:w-96 "
                )}
                key={shelf.id}
              >
                <div className="flex justify-between">
                  <h1 className="text-2xl font-extrabold">{shelf.name}</h1>
                  <Form method="post">
                    <input
                      type="text"
                      hidden
                      defaultValue={shelf.id}
                      name="deleteId"
                    />
                    <button
                      disabled={isDeletingShelf}
                      type="submit"
                      name="action"
                      value={"deleteShelf"}
                      className="text-red-600 text-xs font-bold"
                    >
                      {isDeletingShelf ? (
                        "deleting"
                      ) : (
                        <MdDeleteOutline className="text-3xl text-red-600" />
                      )}
                    </button>
                  </Form>
                </div>

                <ul>
                  {shelf.items.map((item: any) => {
                    return <li key={item.id}>{item.name}</li>;
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Pantry;
