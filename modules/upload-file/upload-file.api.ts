import type { ResponseType } from 'dff-util';
import { api } from "encore.dev/api";
import type { UploadFileDto, UploadFileSearchRequest } from './upload-file.dto';
import UploadFileService from "./upload-file.service";

/**
 * POST /upload-file-save — requests a signed SSS upload URL (util MS
 * `GET /sss-url`) for `fileName`/`type`, builds the id
 * (`provider-type-name-random`) and persists the record. Response includes
 * `uploadUrl` for the caller to PUT the file bytes to directly.
 */
export const SaveUploadFile = api<UploadFileDto, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-file-save",
  },
  async (input) => UploadFileService.SaveService(input),
);

/** GET /upload-file-entity/:id — fetch a single upload-file record. */
export const EntityByIdUploadFile = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "GET",
    path: "/upload-file-entity/:id",
  },
  async ({ id }) => UploadFileService.EntityByIdService(id),
);

/** POST /upload-file-delete — delete an upload-file record by id. */
export const DeleteUploadFile = api<{ id: string }, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-file-delete",
  },
  async ({ id }) => UploadFileService.DeleteService(id),
);

/** POST /upload-file-search — paginated search over upload-file records. */
export const SearchUploadFileEntities = api<UploadFileSearchRequest, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-file-search",
  },
  async (input) => UploadFileService.SearchEntitiesService(input),
);

/** POST /upload-file-status — update upload-file status. */
export const UpdateUploadFileStatus = api<{ id: string; status: string }, ResponseType>(
  {
    expose: true,
    method: "POST",
    path: "/upload-file-status",
  },
  async ({ id, status }) => UploadFileService.UpdateStatusService(id, status),
);
