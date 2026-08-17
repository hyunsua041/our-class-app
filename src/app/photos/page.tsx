import { getPhotos } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { deletePhoto } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";
import PhotoUploadForm from "@/components/PhotoUploadForm";

export default async function PhotosPage() {
  const admin = await isAdmin();
  const photos = await getPhotos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">📸 추억 사진</h1>
        <p className="mt-1 text-sm text-slate-500">
          우리 반의 추억을 사진으로 남겨요.
        </p>
      </div>

      <PhotoUploadForm />

      {photos.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
          아직 올라온 사진이 없어요.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption || "추억 사진"}
                className="aspect-square w-full object-cover"
              />
              {p.caption && (
                <div className="p-2 text-xs text-slate-500">{p.caption}</div>
              )}
              {admin && (
                <div className="absolute right-1 top-1">
                  <DeleteButton onDelete={deletePhoto.bind(null, p.id)} label="✕" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
