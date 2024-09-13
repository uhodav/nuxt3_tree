<template>
  <div class="chat-container">
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue'
import { useRoute, useAsyncData } from '#app'
import { register } from 'vue-advanced-chat'
import type { Room } from "../interfaces/Room";
import type { RoomProps } from "../interfaces/RoomProps";
import type { Message } from "../interfaces/Message";

const name = 'ChatComponent';
const emit = defineEmits([
  'update:currentRoomId',
  'update:rooms',
]);

interface NewRoom {
  room: Room;
}

const Chat = register()

const route = useRoute()
const roomId = route.params.room as string

const props = defineProps<{
  currentUserId: string,
  currentRoomId: string,
  rooms: Array<any>,
}>()

/*const { data: rooms, error } = await useAsyncData('room-data', () =>
  $fetch(`/api/get-rooms?userId=${props.currentUserId}`)
)

if (error.value) {
  console.error('Помилка отримання кімнат:', error.value)
}*/

const messages = ref([])
const showRoomId = ref(props.currentRoomId)
const messagesLoaded = ref(false)
const roomsLoaded = ref(false)
const uploadUrl = '/api/upload-file'

const fetchMessages = async (newRoom: NewRoom) => {
  const roomId = newRoom.room.roomId
  //console.log('fetchMessages 1111', roomId, props.currentRoomId)
  if (roomId !== showRoomId.value) {
    emit('update:currentRoomId', roomId);
    showRoomId.value = roomId
  }
  try {
    const response: Message[] = await $fetch(`/api/get-messages?roomId=${roomId}&userId=${props.currentUserId}`)
    messages.value = response
  } catch (error) {
    console.error('Помилка отримання повідомлень:', error)
  }
}

const sendMessage = async (message: any) => {
  try {
    const response = await $fetch('/api/send-message', {
      method: 'POST',
      body: { message }
    })
    messages.value.push(response.message)
    messagesLoaded.value = true
  } catch (error) {
    console.error('Помилка надсилання повідомлення:', error)
  }
}

const sendFileMessage = async (file: File) => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/upload-file', {
      method: 'POST',
      body: formData
    })

    messages.value.push({
      text: 'Файл загружен',
      file: response.fileUrl
    })
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
  }
}

const getRoomProps = async () => {
  const promises = props.rooms.map(async (room: Room) => {
    try {
      const roomProps: RoomProps = await $fetch(`/api/get-room-props?roomId=${room.roomId}&userId=${props.currentUserId}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer XXXXX',
        },
      })
      const newRom = {
        ...room,
        ...roomProps
      }
      if (JSON.stringify(room) !== JSON.stringify(newRom)) {
        const index = props.rooms.findIndex((item: Room) => item.roomId === newRom.roomId);
        if (index !== -1) {
          props.rooms[index] = newRom
          emit('update:rooms', props.rooms);
        }
      }
    } catch (messageError) {
      console.error(`Помилка при отриманні останнього повідомлення для кімнати ${room.roomId}:`, messageError)
    }
  })
  try {
    await Promise.all(promises);

    roomsLoaded.value = true;
  } catch (error) {
    console.error('Помилка при оновленні властивостей кімнати:', error);
  }
}

const test = (type: string, val: any) => {
  console.log('type', type)
  console.log('val', val)
}

watch(() => props.rooms, async () => {
    await getRoomProps()
  },
  {
    immediate: true // Виконати відразу під час монтування
  }
)
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
