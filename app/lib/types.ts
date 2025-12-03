export type CatalogDTO = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  imageMimeType?: string;
  itemViewType?: "type1" | "type2" | "type3";
};

export type UserDTO = {
  id: string;
  email: string;
};
