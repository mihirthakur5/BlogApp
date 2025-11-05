import { useLogoutMutation } from "@/src/services/api";
import Image from "next/image";
import Link from "next/link";

const MobileNav = (
  profile: any,
  profileId: number,
  isLoading: boolean,
  setOpen: any
) => {
  const [logout] = useLogoutMutation();

  return !isLoading && profile ? (
    <div className="flex flex-col md:flex-row items-center gap-3">
      {profileId ? (
        <Link
          href={`/profile/${profileId}`}
          className="flex flex-col md:hidden lg:flex gap-2 md:flex-row items-center"
        >
          <Image
            src={
              profile.avatar
                ? `/uploads/${profile.avatar}`
                : "/blank-profile.svg"
            }
            alt={profile.username}
            width={200}
            height={200}
            className="rounded-full object-cover h-24 w-24 md:h-10 md:w-10 shadow-md"
            unoptimized
          />
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="text-sm text-gray-700 md:hidden">
              @{profile.username}
            </p>
          </div>
        </Link>
      ) : (
        <span className="text-sm text-black">{profile?.username}</span>
      )}
      <Link
        href="/create"
        className="text-sm font-semibold text-center w-[80px] px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
        onClick={() => setOpen(false)}
      >
        Create
      </Link>
      <button
        onClick={async () => {
          await logout();
          window.location.href = "/";
        }}
        className="text-sm font-semibold w-[80px] px-3 py-2 bg-black text-white rounded-md shadow-md hover:opacity-80"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex w-[200px] text-center flex-col md:flex md:flex-row items-center gap-3">
      <Link
        href="/login"
        className="text-sm bg-blue-600 w-[80px] text-white font-semibold px-3 py-2 shadow-md rounded-md hover:bg-blue-700"
        onClick={() => setOpen(false)}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="text-sm bg-black text-white w-[80px] font-bold px-2 py-2 shadow-md rounded-md hover:opacity-80"
        onClick={() => setOpen(false)}
      >
        Register
      </Link>
    </div>
  );
};

export default MobileNav;
