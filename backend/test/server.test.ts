import { server } from "../src/server"
import Prisma from "../src/db";

beforeAll(async () => {
  await server.ready(); // Ensure the server is ready
});

afterAll(async () => {
  await server.close(); // Close the server after tests
});

test('GET /get/ should return an empty array when the database is empty', async () => {
  await Prisma.entry.deleteMany();

  const response = await server.inject({
    method: 'GET',
    url: '/get/',
  });

  expect(response.statusCode).toBe(200);
  const responseData = response.json();

  expect(Array.isArray(responseData)).toBe(true);
  expect(responseData).toHaveLength(0);
});

test('GET /get/ should return the correct number of total entries', async () => {
  await Prisma.entry.deleteMany();

  const entriesToCreate = [
    {
      title: 'Entry 1',
      description: 'Description 1',
      scheduled_date: '2024-12-10',
    },
    {
      title: 'Entry 2',
      description: 'Description 2',
      scheduled_date: '2024-12-11',
    },
  ];

  for (const entry of entriesToCreate) {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/create/',
      payload: entry,
    });

    expect(createResponse.statusCode).toBe(200);
  }

  const response = await server.inject({
    method: 'GET',
    url: '/get/',
  });

  expect(response.statusCode).toBe(200);
  const responseData = response.json();

  expect(Array.isArray(responseData)).toBe(true);
  expect(responseData).toHaveLength(entriesToCreate.length);
  expect(responseData[0]).toHaveProperty('title', 'Entry 1');
  expect(responseData[1]).toHaveProperty('title', 'Entry 2');
});


test('GET /get/:id should return the correct entry', async () => {
  const createdEntry = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: 'Test Entry',
      description: 'This is a test',
      scheduled_date: '2024-12-10',
    },
  });

  const entryId = createdEntry.json().id;

  const response = await server.inject({
    method: 'GET',
    url: `/get/${entryId}`,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('id', entryId);
});

test('GET /get/:id should return 500 for nonexistent id', async () => {
  const response = await server.inject({
    method: 'GET',
    url: '/get/nonexistent-id',
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error finding entry with id nonexistent-id')
});

test('POST /create/ should create a new entry', async () => {
  const newEntry = {
    title: 'Test Entry',
    description: 'This is a test',
    scheduled_date: '2024-12-10',
    created_at: '2024-12-01T12:00:00Z', 
  };

  const response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: newEntry,
  });

  expect(response.statusCode).toBe(200);
  const responseData = response.json();

  expect(responseData).toHaveProperty('id');
  expect(responseData.title).toBe(newEntry.title);
  expect(responseData.description).toBe(newEntry.description);

  
  expect(new Date(responseData.scheduled_date).toISOString()).toBe(
    new Date(newEntry.scheduled_date).toISOString()
  );

  
  expect(new Date(responseData.created_at).toISOString()).toBe(
    new Date(newEntry.created_at).toISOString()
  );
});


test('POST /create/ should create a new entry with created_at automatically assigned', async () => {
  const newEntry = {
    title: 'Test Entry',
    description: 'This is a test',
    scheduled_date: '2024-12-10',
  };

  const response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: newEntry,
  });

  expect(response.statusCode).toBe(200);
  const responseData = response.json();

  expect(responseData).toHaveProperty('id');
  expect(responseData.title).toBe(newEntry.title);
  expect(responseData.description).toBe(newEntry.description);

  
  expect(new Date(responseData.scheduled_date).toISOString()).toBe(
    new Date(newEntry.scheduled_date).toISOString()
  );

  
  expect(new Date(responseData.created_at)).toBeInstanceOf(Date);
});

test('POST /create/ should return 500 for missing fields', async () => {
  const invalidEntry = { title: 'Test Title' }; 
  const response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: invalidEntry,
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error creating entry');
});

test('POST /create/ should return 500 for invalid scheduled_date', async () => {
  const invalidEntry = {
    title: 'Test Entry',
    description: 'Invalid date test',
    scheduled_date: 'not-a-valid-date',
  };

  const response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: invalidEntry,
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error creating entry');
});

test('POST /create/ should return 500 for empty title', async () => {
  const response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: '',
      description: 'Valid description',
      scheduled_date: '2024-12-10',
    },
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error creating entry');
});

test('Handles concurrent POST requests gracefully', async () => {
  const payload = {
    title: 'Concurrent Entry',
    description: 'Testing concurrency',
    scheduled_date: '2024-12-10',
  };

  const requests = Promise.all([
    server.inject({ method: 'POST', url: '/create/', payload }),
    server.inject({ method: 'POST', url: '/create/', payload }),
  ]);

  const responses = await requests;
  responses.forEach((response) => {
    expect(response.statusCode).toBe(200);
  });
});

test('POST /create/ should return 500 when attempting to create an entry with duplicate unique data', async () => {
  const firstEntryPayload = {
    title: 'Unique Title',
    description: 'Description for unique title',
    scheduled_date: '2024-12-10',
  };

  const firstResponse = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: firstEntryPayload,
  });

  expect(firstResponse.statusCode).toBe(200); 
  const createdEntry = firstResponse.json();

  const duplicatePayload = {
    ...firstEntryPayload,
    id: createdEntry.id,
  };

  const duplicateResponse = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: duplicatePayload,
  });

  expect(duplicateResponse.statusCode).toBe(500);
  expect(duplicateResponse.json()).toHaveProperty('msg', 'Error creating entry');
});

test('PUT /update/:id should update an entry', async () => {
  const createdEntry = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: 'Original Title',
      description: 'Original Description',
      scheduled_date: '2024-12-10',
    },
  });

  const entryId = createdEntry.json().id;

  const updatedEntry = {
    title: 'Updated Title',
    description: 'Updated Description',
    scheduled_date: '2024-12-20',
  };

  const response = await server.inject({
    method: 'PUT',
    url: `/update/${entryId}`,
    payload: updatedEntry,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('msg', 'Updated successfully');

  const getResponse = await server.inject({
    method: 'GET',
    url: `/get/${entryId}`,
  });

  const responseData = getResponse.json();
  expect(responseData.title).toBe(updatedEntry.title);
  expect(responseData.description).toBe(updatedEntry.description);

  expect(new Date(responseData.scheduled_date).toISOString()).toBe(
    new Date(updatedEntry.scheduled_date).toISOString()
  );

  expect(new Date(responseData.created_at)).toBeInstanceOf(Date);
});

test('PUT /update/:id should return 500 for nonexistent id', async () => {
  const response = await server.inject({
    method: 'PUT',
    url: '/update/nonexistent-id',
    payload: {
      title: 'Updated Title',
      description: 'Updated Description',
      scheduled_date: '2024-12-20',
    },
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error updating');
});
test('PUT /update/:id should return 500 for invalid data types', async () => {
  const createdEntry = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: 'Original Title',
      description: 'Original Description',
      scheduled_date: '2024-12-10',
    },
  });

  const entryId = createdEntry.json().id;

  const response = await server.inject({
    method: 'PUT',
    url: `/update/${entryId}`,
    payload: {
      title: 123,
      description: null,
      scheduled_date: 'not-a-date',
    },
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error updating');
});


test('PUT /update/:id should update only the provided fields in a partial payload', async () => {
  const createdEntry = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: 'Original Title',
      description: 'Original Description',
      scheduled_date: '2024-12-10',
    },
  });

  const entryId = createdEntry.json().id;

  const partialUpdatePayload = {
    title: 'Updated Title',
  };

  const response = await server.inject({
    method: 'PUT',
    url: `/update/${entryId}`,
    payload: partialUpdatePayload,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('msg', 'Updated successfully');

  const getResponse = await server.inject({
    method: 'GET',
    url: `/get/${entryId}`,
  });

  const updatedEntry = getResponse.json();

  expect(updatedEntry.title).toBe(partialUpdatePayload.title);
  expect(updatedEntry.description).toBe('Original Description');
  expect(new Date(updatedEntry.scheduled_date).toISOString()).toBe(
    new Date('2024-12-10').toISOString()
  );
});

test('DELETE /delete/:id should delete an entry', async () => {
  const createdEntry = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: {
      title: 'Entry to Delete',
      description: 'This entry will be deleted',
      scheduled_date: '2024-12-10',
    },
  });

  const entryId = createdEntry.json().id;

  const response = await server.inject({
    method: 'DELETE',
    url: `/delete/${entryId}`,
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('msg', 'Deleted successfully');

  const getResponse = await server.inject({
    method: 'GET',
    url: `/get/${entryId}`,
  });

  expect(getResponse.statusCode).toBe(500);
  expect(getResponse.json()).toHaveProperty('msg', `Error finding entry with id ${entryId}`)
});

test('DELETE /delete/:id should return 500 for nonexistent id', async () => {
  const response = await server.inject({
    method: 'DELETE',
    url: '/delete/nonexistent-id',
  });

  expect(response.statusCode).toBe(500);
  expect(response.json()).toHaveProperty('msg', 'Error deleting entry');
});

test('DELETE /delete/:id should delete the correct entry and leave others intact', async () => {
  await Prisma.entry.deleteMany();

  const entry1Payload = {
    title: 'Entry 1',
    description: 'Description 1',
    scheduled_date: '2024-12-10',
  };
  const entry1Response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: entry1Payload,
  });

  expect(entry1Response.statusCode).toBe(200);
  const entry1 = entry1Response.json();

  const entry2Payload = {
    title: 'Entry 2',
    description: 'Description 2',
    scheduled_date: '2024-12-11',
  };
  const entry2Response = await server.inject({
    method: 'POST',
    url: '/create/',
    payload: entry2Payload,
  });

  expect(entry2Response.statusCode).toBe(200);
  const entry2 = entry2Response.json();

  const deleteResponse = await server.inject({
    method: 'DELETE',
    url: `/delete/${entry1.id}`,
  });

  expect(deleteResponse.statusCode).toBe(200);
  expect(deleteResponse.json()).toHaveProperty('msg', 'Deleted successfully');

  const getDeletedResponse = await server.inject({
    method: 'GET',
    url: `/get/${entry1.id}`,
  });

  expect(getDeletedResponse.statusCode).toBe(500); 

  const getRemainingResponse = await server.inject({
    method: 'GET',
    url: `/get/${entry2.id}`,
  });

  expect(getRemainingResponse.statusCode).toBe(200);
  const remainingEntry = getRemainingResponse.json();
  expect(remainingEntry).toHaveProperty('id', entry2.id);
  expect(remainingEntry).toHaveProperty('title', 'Entry 2');
  expect(remainingEntry).toHaveProperty('description', 'Description 2');
});
