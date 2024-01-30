import { randomUUID } from "crypto";
import IRepository, {
  CreateEntityOptions,
  FirestoreWhereOptions,
  RepositoryOptions,
} from "./types/irepository";

export default class TestRepository<
  T extends FirebaseFirestore.DocumentData,
  TDto
> implements IRepository
{
  database: { [id: string]: T };

  constructor(database: { [id: string]: T }) {
    this.database = database;
  }

  mapDocumentToDto(
    document: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ) {
    throw new Error("Method not implemented.");
  }

  async createBatch(batchPayload: T[]): Promise<string[]> {
    const ids: string[] = [];
    batchPayload.forEach((payload) => {
      const id = randomUUID();

      ids.push(id);

      this.database[id] = payload;
    });

    return await ids;
  }

  create(payload: T, options?: CreateEntityOptions): TDto {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      return { id: null } as TDto;
    }

    let id = randomUUID();

    if (options) {
      if (options.customId) {
        id = options.customId;
      }
    }

    this.database[id] = payload;

    const dataDto = {
      id,
      ...payload,
    } as TDto;
    return dataDto;
  }

  async fetchData(id: string): Promise<TDto | null> {
    const doc = this.database[id];
    if (doc) {
      const data = doc as T;
      const dataDto = {
        id,
        ...data,
      } as TDto;
      return dataDto;
    }

    return null;
  }

  async fetchDocument(
    id: string
  ): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null> {
    return null;
  }

  async update(id: string, payload: Partial<T>): Promise<string | null> {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      return id;
    }

    const doc = await this.database[id];
    if (!doc) {
      return null;
    }

    this.database[id] = {
      ...this.database[id],
      ...payload,
    };
    return id;
  }

  remove(id: string): string {
    this.database[id].delete();
    return id;
  }

  async checkIfEntityExist(id: string): Promise<boolean> {
    const document = this.database[id];

    if (!document) {
      return false;
    }

    return true;
  }

  async checkIfEntitiesExist(ids: string[]): Promise<boolean> {
    if (!ids || ids.length === 0) {
      return false;
    }

    const keys = Object.keys(this.database);
    const documents = keys.filter((k) => ids.includes(k));

    if (documents.length === 0) {
      return false;
    }

    if (ids.length !== documents.length) {
      return false;
    }

    return true;
  }

  async fetchBulkData(ids: string[]): Promise<TDto[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const keys = Object.keys(this.database);
    return keys.reduce((acc: TDto[], val: string) => {
      const doc = this.database[val];

      if (doc) {
        const data = doc as T;

        const dataDto = {
          id: val,
          ...data,
        } as TDto;
        acc.push(dataDto);
      }

      return acc;
    }, []);
  }

  async queryAll(
    where: FirestoreWhereOptions[],
    options?: RepositoryOptions
  ): Promise<TDto[]> {
    const keys = Object.keys(this.database);
    const results = keys.map((k: string) => {
      const entity: T = this.database[k];
      const res = { id: k, ...entity } as TDto;
      return res;
    });

    return results;
  }
}
