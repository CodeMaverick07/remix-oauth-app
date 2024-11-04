/* eslint-disable @typescript-eslint/no-explicit-any */
import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";

import { getAllShelves } from "~/model/pantry-shelf.server";
import classNames from "classnames";
import { CiSearch } from "react-icons/ci";

import { Skeleton } from "~/components/ui/skeleton";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url).searchParams.get("q");
  const shelves = await getAllShelves(url);
  return json({ shelves });
};

const Pantry = () => {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSearching = navigation.formData?.has("q");

  return (
    <div>
      <Form
        className={classNames(
          "flex border-2 border-gray-300 rounded-md",
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
                  "border-2 border-blue-600 rounded-md p-4",
                  "w-[calc(100vw-2rem)] flex-none snap-center ",
                  "md:w-96 "
                )}
                key={shelf.id}
              >
                <h1 className="text-2xl font-extrabold">{shelf.name}</h1>
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
