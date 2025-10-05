namespace WatchList.Server.Services
{
    public class LinksManager : ILinksManager
    {
        private readonly string filename = "download.list";
        private readonly List<string> storedLinks;
        public LinksManager()
        {
            using (var fileStream = File.Open(filename, FileMode.OpenOrCreate, FileAccess.Read, FileShare.Read))
            {
                using (var reader = new StreamReader(fileStream))
                {
                    storedLinks = new(reader.ReadToEnd()
                        .Split()
                        .Where(x => !string.IsNullOrWhiteSpace(x)));
                }
            }
        }

        public IReadOnlyCollection<string> GetAll(int pageNumber = 0, int pageSize = 100)
        {
            return storedLinks
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToArray();
        }

        public bool IsLinkExist(string url)
        {
            return storedLinks.Contains(url);
        }

        public bool AddLink(string url)
        {
            if (!Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out Uri? uriResult))
            {
                throw new ArgumentException("Invalid URL");
            }

            if (!IsLinkExist(url))
            {
                using (var fileStream = File.Open(filename, FileMode.Append, FileAccess.Write, FileShare.ReadWrite))
                {
                    using (var writer = new StreamWriter(fileStream))
                    {
                        writer.WriteLine(url);
                        storedLinks.Add(url);
                        return true;
                    }
                }
            }

            return false;
        }
    }
}