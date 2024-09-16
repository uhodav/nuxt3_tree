import { defineEventHandler } from 'h3'

export default defineEventHandler(async (/*event*/) => {
  try {
    const rooms: any[] = await $fetch('https://smarttender.biz/api/prozorro/ReferenceBooks/classificationNew?phrase=&schemeType=1', {
      method: 'GET',
      headers: {
        // Якщо потрібно зазначимо
        Authorization: 'Bearer XXXXX',
      },
    })

    return rooms
  } catch (error) {
    console.error('Помилка при отриманні даних:', error)
    return {
      statusCode: 500,
      statusMessage: 'Помилка при отриманні даних',
    }
  }
})
