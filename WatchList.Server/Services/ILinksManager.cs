namespace WatchList.Server.Services
{
    public interface ILinksManager
    {
        IReadOnlyCollection<string> GetAll(int pageNumber = 0, int pageSize = 100);
        bool IsLinkExist(string url);
        bool AddLink(string url);
    }
}