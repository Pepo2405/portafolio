type Folder = {
  title: string,
  children?: any
  icon?: string,
  links?: any[],
}

interface LinkDrag {
  title: string,
  url: string,
  icon?: string
}

interface Project {
  title: string;
  url?: string;
  type?: string;
  icon: string;
  featured?: boolean;
  description?: string;
  stack?: string[];
}
