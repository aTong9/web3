<script setup lang="ts">
import type { AppPermission } from '@/types'
import { useAuth } from '@/composables/use-auth'
defineProps<{ permission: AppPermission }>()
const { can } = useAuth()
</script>
<template><slot v-if="can(permission)" /></template>
