<template>
  <el-config-provider size="small">
    <User />
  </el-config-provider>
</template>
<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import User from '@/pages/User.vue';
</script>
<style scoped></style>
