export type CatalogDTO = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  imageMimeType?: string;
};

export type UserDTO = {
  id: string;
  email: string;
};
