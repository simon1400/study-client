// TypeScript 6 по умолчанию проверяет side-effect импорты (noUncheckedSideEffectImports),
// а Next объявляет только *.module.css/scss — добавляем обычные глобальные стили.
declare module '*.css';
declare module '*.scss';
