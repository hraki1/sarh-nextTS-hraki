"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronRight, FiSearch, FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { getBrands } from "@/lib/axios/brandsAxios";
import { getCategories } from "@/lib/axios/categoryAxios";
import { getCollections } from "@/lib/axios/collectionsAxios";
import Spinner from "../UI/SpinnerLoading";
import { Category } from "@/lib/models/categoryModal";
import { BrandWithProducts } from "@/lib/models/brandsModal";
import { Collection } from "@/lib/models/collectionModal";

interface Group {
  name: string;
  subcategories: string[]; // names only
  ids: number[];
}

export default function PremiumNavWidget() {
  const [groups, setGroups] = useState<Group[]>([]);

  console.log(groups);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>("");
  const router = useRouter();

  const {
    data: brandsData,
    isLoading: isLoadingBrands,
    error: errorBrands,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  console.log(brandsData);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    data: collectionsData,
    isLoading: isLoadingCollections,
    error: errorCollections,
    refetch,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  useEffect(() => {
    if (categoriesData && brandsData && collectionsData) {
      const newGroups = [
        {
          name: "Categories",
          subcategories: categoriesData.data.map(
            (cat: Category) => cat.description.name
          ),
          ids: categoriesData.data.map((cat: Category) => cat.id),
        },
        {
          name: "Brands",
          subcategories: brandsData.data.map(
            (brand: BrandWithProducts) => brand.name
          ),
          ids: brandsData.data.map((brand: BrandWithProducts) => brand.id),
        },
        {
          name: "Collections",
          subcategories: collectionsData.collections.map(
            (col: Collection) => col.name
          ),
          ids: collectionsData.collections.map(
            (col: Collection) => col.collection_id
          ),
        },
      ];

      setGroups(newGroups);
    }
  }, [categoriesData, brandsData, collectionsData]);

  function handleSearchTerm() {
    if (term) {
      router.push(`/shopGrid?query=${encodeURIComponent(term)}`);
      setIsOpen(false);
      setTerm(null);
    }
  }

  if (isLoadingBrands || isLoadingCollections || isLoadingCategories) {
    return (
      <div className="my-40 mt-56">
        <Spinner />
      </div>
    );
  }

  if (errorBrands || errorCategories || errorCollections) {
    return (
      <div className="text-center py-10">
        <h3 className="text-red-500">
          {" "}
          {errorBrands?.name || errorCategories?.name || errorCollections?.name}
        </h3>
        <p className="py-10">
          {errorBrands?.message ||
            errorCategories?.message ||
            errorCollections?.message}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Premium Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 group"
        aria-label="Open navigation"
      >
        <div className="flex flex-col gap-1 items-center">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-6 h-0.5 bg-gray-800 block"
              animate={{
                width: isOpen ? 0 : 24,
                opacity: isOpen ? 0 : 1,
              }}
              transition={{
                duration: 0.3,
                delay: isOpen ? i * 0.05 : (3 - i) * 0.05,
              }}
            />
          ))}
          <motion.span
            className="absolute w-6 h-0.5 bg-gray-800 origin-center"
            animate={{
              rotate: isOpen ? 45 : 0,
              y: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="absolute w-6 h-0.5 bg-gray-800 origin-center"
            animate={{
              rotate: isOpen ? -45 : 0,
              y: isOpen ? -1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>

      {/* Luxury Off-Canvas Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Frosted Glass Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-lg z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Sleek Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed flex-1 overflow-y-auto min-h-0 px-3 top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col border-l border-gray-100"
            >
              {/* Minimal Header */}
              <div className="flex justify-between items-center p-5">
                <div className="text-lg font-medium tracking-tight">Browse</div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-50 rounded-full transition-all"
                  aria-label="Close menu"
                >
                  <FiX className="text-gray-500" size={22} />
                </button>
              </div>

              {/* Floating Search */}
              <div className="px-5 pb-3">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={term ?? ""}
                    onChange={(e) => setTerm(e.target.value)}
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {term && (
                      <motion.span
                        className="absolute top-4 right-6 text-2xl text-gray-500 cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleSearchTerm}
                      >
                        <FaSearch />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Premium Category Navigation */}
              <div className="flex-1  px-3">
                <ul className="space-y-1">
                  {groups.map((category) => (
                    <li key={category.name}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="origin-left"
                      >
                        <button
                          onClick={() =>
                            setActiveCategory(
                              activeCategory === category.name
                                ? null
                                : category.name
                            )
                          }
                          className="w-full flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl transition-all"
                        >
                          <span className="font-medium text-gray-900">
                            {category.name}
                          </span>
                          <motion.div
                            animate={{
                              rotate: activeCategory === category.name ? 90 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronRight className="text-gray-400" />
                          </motion.div>
                        </button>
                      </motion.div>

                      <AnimatePresence>
                        {activeCategory === category.name && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              transition: {
                                opacity: { duration: 0.2 },
                                height: { duration: 0.3 },
                              },
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                              transition: {
                                opacity: { duration: 0.1 },
                                height: { duration: 0.2 },
                              },
                            }}
                            className="pl-6 overflow-hidden"
                          >
                            {category.subcategories.map((subcategory) => (
                              <motion.li
                                key={subcategory}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  transition: { delay: 0.1 },
                                }}
                              >
                                <Link
                                  href={`/shopGrid?${category.name}=${subcategory}`}
                                  className="block py-3 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {subcategory}
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  ))}
                </ul>
              </div>

              <ul>
                <li className="px-8 py-5">
                  <Link href={"/contact"} onClick={() => setIsOpen(false)}>
                    Pubulare Question
                  </Link>
                </li>
                <li className="px-8 py-5">
                  <Link href={"/about"} onClick={() => setIsOpen(false)}>
                    About Us
                  </Link>
                </li>
              </ul>
              {/* User Section */}
              <div className="p-5 border-t border-gray-100">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiUser className="text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">My Account</div>
                    <div className="text-sm text-gray-500">View profile</div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
