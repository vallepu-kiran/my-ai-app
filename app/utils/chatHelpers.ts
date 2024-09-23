interface Chat {
    id: number;
    title: string;
    created_at: string;
}

export const categorizeChats = (chats: Chat[]) => {

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();
    const yesterdayStart = new Date(now.setDate(now.getDate() - 1)).getTime();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).getTime();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).getTime();
    const lastMonthStart = new Date(now.setMonth(now.getMonth() - 1, 1)).setHours(0, 0, 0, 0);
    const lastMonthEnd = new Date(now.setMonth(now.getMonth(), 0)).setHours(23, 59, 59, 999);

    return chats.reduce((categories, chat) => {
        const chatTimestamp = new Date(chat.created_at).getTime(); 

        if (chatTimestamp >= todayStart) {
            categories['Today'] = [...(categories['Today'] || []), chat];
        } else if (chatTimestamp >= yesterdayStart) {
            categories['Yesterday'] = [...(categories['Yesterday'] || []), chat];
        } else if (chatTimestamp >= sevenDaysAgo) {
            categories['Previous 7 Days'] = [...(categories['Previous 7 Days'] || []), chat];
        } else if (chatTimestamp >= thirtyDaysAgo) {
            categories['Previous 30 Days'] = [...(categories['Previous 30 Days'] || []), chat];
        } else if (chatTimestamp >= lastMonthStart && chatTimestamp <= lastMonthEnd) {
            const monthName = new Date(chatTimestamp).toLocaleString('default', { month: 'long' });
            categories[`Last Month (${monthName})`] = [...(categories[`Last Month (${monthName})`] || []), chat];
        } else {
            categories['Earlier'] = [...(categories['Earlier'] || []), chat];
        }

        return categories;
    }, {} as Record<string, Chat[]>);
};


