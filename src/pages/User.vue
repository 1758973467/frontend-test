<template>
  <header class="flex">
    <el-button @click="onAdd">Add User</el-button>
  </header>
  <el-table :data="tableData" v-loading="loading" stripe class="mt-10">
    <el-table-column label="id" prop="id"></el-table-column>
    <el-table-column label="name" prop="name">
      <template #default="scope">
        <el-form
          :model="scope.row"
          :ref="`formRef${scope.$index}name`"
          v-if="rowEditMode.edit && rowEditMode.index === scope.$index"
        >
          <el-form-item prop="name" :rules="rules.name">
            <el-input v-model="scope.row.name"></el-input>
          </el-form-item>
        </el-form>

        <span v-else>{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column label="gender" prop="gender">
      <template #default="scope">
        <el-form
          :model="scope.row"
          :ref="`formRef${scope.$index}gender`"
          v-if="rowEditMode.edit && rowEditMode.index === scope.$index"
        >
          <el-form-item prop="gender" :rules="rules.gender">
            <el-select v-model="scope.row.gender">
              <el-option label="female" :value="0"></el-option>
              <el-option label="male" :value="1"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span v-else>{{ EGender[scope.row.gender] }}</span>
      </template>
    </el-table-column>
    <el-table-column label="edit" width="150" fixed="right">
      <template #default="scope">
        <template v-if="!rowEditMode.edit">
          <el-button @click="handleRowEdit(scope)"> Edit </el-button>
        </template>
        <div v-else>
          <el-button @click="handleRowEdit(scope)">Save</el-button>
          <el-button @click="clearRowEdit()">Cancel</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
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
          <el-option label="female" :value="1"></el-option>
          <el-option label="male" :value="0"></el-option>
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
</template>
<script setup lang="ts">
import { type IUser, EGender } from './types';
import type { FormInstance, FormRules } from 'element-plus';
import { getCurrentInstance, reactive, ref } from 'vue';
import { debouncedWatch } from '@vueuse/core';
import { getUserData, saveUserData, updateUserData } from '@/api/user';
import { useSingleRowEdit } from './hooks';
import { ElMessage } from 'element-plus';
const context = getCurrentInstance();
type RuleForm = Omit<IUser, 'id'>;

const modelVisible = ref(false);
const onAdd = () => {
  modelVisible.value = true;
};
const { rowEditMode, clearRowEdit, doRowEdit } = useSingleRowEdit();
const handleRowEdit = (scope: { $index: number; row: IUser }) => {
  doRowEdit(scope, () => {
    if (!rowEditMode.value.edit) {
      const promises = Object.keys(context?.refs)
        .filter(key => {
          return key.startsWith(`formRef${scope.$index}`);
        })
        .map(item => {
          return context?.refs[item].validate();
        });
      Promise.all(promises).then(async (data: boolean[]) => {
        if (data.every(item => item === true)) {
          const { data } = await updateUserData(scope.row.id, {
            ...scope.row,
          });

          if (data && data.code === 200) {
            ElMessage.info('更新成功');
          } else {
            ElMessage.info('更新失败');
          }
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
    { min: 3, max: 10, message: 'Length should be 3 to 5', trigger: 'blur' },
  ],
  gender: [
    {
      required: true,
      type: 'enum',
      enum: [0, 1],
      message: 'Please select gender',
      trigger: 'change',
    },
  ],
});
const onSubmit = async () => {
  await ruleFormRef.value?.validate(async valid => {
    if (valid) {
      const { data } = await saveUserData({
        ...modelForm.value,
      });
      if (data && data.code === 200) {
        ElMessage.info('添加成功');
      } else {
        ElMessage.error('添加失败');
      }
      pager.value = {
        ...pager.value,
        currentPage: 1,
      };
      modelVisible.value = false;
    }
  });
};

debouncedWatch(
  () => pager,
  async () => {
    loading.value = true;
    const { data } = await getUserData({
      pageSize: pager.value.pageSize,
      pageNumber: pager.value.currentPage,
    });
    if (data.code === 200) {
      tableData.value = data.data.data;
      pager.value.total = data.data.total;
    }

    loading.value = false;
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
<style scoped></style>
