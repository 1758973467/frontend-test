<template>
  <el-config-provider size="small">
    <header class="flex">
      <el-button @click="onAdd">Add User</el-button>
    </header>
    <el-form :model="tableData" ref="singleEditFormRef">
      <el-table :data="tableData" v-loading="" stripe class="mt-10">
        <el-table-column label="id" prop="id"></el-table-column>
        <el-table-column label="name" prop="name">
          <template #default="scope">
            <el-form-item
              :prop="'name' + scope.$index"
              :rules="rules.name"
              v-if="rowEditMode.edit && rowEditMode.index === scope.$index"
            >
              <el-input v-model="scope.row.name"></el-input>
            </el-form-item>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="gender" prop="gender">
          <template #default="scope">
            <el-form-item
              :prop="'gender' + scope.$index"
              :rules="rules.gender"
              v-if="rowEditMode.edit && rowEditMode.index === scope.$index"
            >
              <el-select v-model="scope.row.gender">
                <el-option label="female" value="female"></el-option>
                <el-option label="male" value="male"></el-option>
              </el-select>
            </el-form-item>
            <span v-else>{{ scope.row.gender }}</span>
          </template>
        </el-table-column>
        <el-table-column label="edit">
          <template #default="scope">
            <template v-if="!rowEditMode.edit">
              <el-button @click="handleRowEdit(scope)"> Edit </el-button>
            </template>
            <div>
              <el-button @click="handleRowEdit(scope)">Save</el-button>
              <el-button @click="clearRowEdit()">Cancel</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <el-pagination
      layout="prev, pager, next"
      v-model:current-page="pager.currentPage"
      :total="pager.total"
    />
    <el-dialog v-model="modelVisible" title="Add user">
      <el-form :model="modelForm" ref="ruleFormRef" status-icon :rules="rules" label-width="120px">
        <el-form-item label="name:" prop="name">
          <el-input v-model="modelForm.name"></el-input>
        </el-form-item>
        <el-form-item label="gender:" prop="gender">
          <el-select v-model="modelForm.gender">
            <el-option label="female" value="female"></el-option>
            <el-option label="male" value="male"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex">
          <el-button @click="modelVisible = false">Cancel</el-button>
          <el-button @click="onSubmit">Confirm</el-button>
        </div>
      </template>
    </el-dialog>
  </el-config-provider>
</template>
<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import { type IUser, EGender } from './types';
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { debouncedWatch } from '@vueuse/core';
import { getUserData, saveOrUpdateUserData } from '@/api/user';
import { useSingleRowEdit } from './hooks';
type RuleForm = Omit<IUser, 'id'>;

const modelVisible = ref(false);
const onAdd = () => {
  modelVisible.value = true;
};

const { rowEditMode, clearRowEdit, doRowEdit } = useSingleRowEdit();
const singleEditFormRef = ref<FormInstance>();
const handleRowEdit = (scope: { $index: number; row: IUser }) => {
  doRowEdit(scope, () => {
    if (!rowEditMode.value.edit) {
      singleEditFormRef.value?.validate(async valid => {
        if (valid) {
          await saveOrUpdateUserData({
            ...scope.row,
          });
          pager.value = {
            ...pager.value,
            currentPage: 1,
          };
        }
      });
    }
  });
};

const modelForm = ref({
  name: '',
  gender: EGender.Female,
});

const tableData = ref<IUser[]>([]);
const pager = ref({
  currentPage: 0,
  pageSize: 10,
  total: 0,
});
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: 'Please input user name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  gender: [
    {
      required: true,
      type: 'enum',
      enum: Object.values(EGender),
      message: 'Please select gender',
      trigger: 'change',
    },
  ],
});
const onSubmit = async () => {
  await ruleFormRef.value?.validate(async valid => {
    if (valid) {
      await saveOrUpdateUserData({
        ...modelForm.value,
      });
      pager.value = {
        ...pager.value,
        currentPage: 1,
      };
    }
  });
};

debouncedWatch(
  () => pager,
  async () => {
    loading.value = true;
    const { total, data } = await getUserData({
      pageSize: pager.value.pageSize,
      pageNumber: pager.value.currentPage,
    });
    tableData.value = data;
    pager.value.total = total;
    loading.value = false;
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
<style scoped></style>
