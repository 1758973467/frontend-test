import { ref } from 'vue';

export const useSingleRowEdit = () => {
  const rowEditMode = ref({
    edit: false,
    index: -1,
  });

  const clearRowEdit = () => {
    rowEditMode.value = {
      edit: false,
      index: -1,
    };
  };
  const doRowEdit = (scope: { $index: number; row: any }, callback: Function) => {
    rowEditMode.value.index = scope.$index;
    rowEditMode.value.edit = !rowEditMode.value.edit;
    callback && callback();
  };

  return {
    rowEditMode,
    clearRowEdit,
    doRowEdit,
  };
};
