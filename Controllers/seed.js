async function seedDatabase() {
    try {
        // Seed Users
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding Users...');
            await User.insertMany([
                // !! SECURITY WARNING: Plain text passwords used as requested. VERY INSECURE.
                { username: 'admin', email: 'admin@example.com', password: 'password123', role: 'Admin' },
                { username: 'staff1', email: 'staff1@example.com', password: 'password123', role: 'Staff' },
                { username: 'staff2', email: 'staff2@example.com', password: 'password123', role: 'Staff' },
                { username: 'doc1', email: 'doc1@example.com', password: 'password123', role: 'Medical' },
                { username: 'teacher1', email: 'teacher1@example.com', password: 'password123', role: 'Educational' }
            ]);
            console.log('Users seeded.');
        }
        // Seed Children
        const childCount = await Child.countDocuments();
        if (childCount === 0) {
            console.log('Seeding Children...');
            await Child.insertMany([
                { first_name: 'Alice', last_name: 'Smith', date_of_birth: new Date('2018-05-15'), gender: 'Female', admission_date: new Date('2023-01-10') },
                { first_name: 'Bob', last_name: 'Jones', date_of_birth: new Date('2019-11-22'), gender: 'Male', admission_date: new Date('2023-02-20') },
                { first_name: 'Charlie', last_name: 'Brown', date_of_birth: new Date('2017-03-01'), gender: 'Male', admission_date: new Date('2022-12-05') }
            ]);
            console.log('Children seeded.');
        }

        // Note: Seeding related data (Health Records, Education, etc.) requires getting the IDs
        // of the newly created children/users. For simplicity, this example doesn't seed related data.
        // In a real app, you'd fetch the IDs after seeding Users/Children and use them here.

    } catch (error) {
        console.error('Error seeding database:', error);
    }
}
seedDatabase();