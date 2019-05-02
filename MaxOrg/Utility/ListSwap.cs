using System.Collections.Generic;

namespace MaxOrg.Utility
{
    public static class ListSwap
    {
        public static IList<T> Swap<T>(this IList<T> list, int indexA, int indexB)
        {
            var tmp = list[indexA];
            list[indexA] = list[indexB];
            list[indexB] = tmp;
            return list;
        }
    }
}