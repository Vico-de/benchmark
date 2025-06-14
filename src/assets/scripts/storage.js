const STORAGE_KEY = 'tags';

let callbacks = [];

function toggleTag(tag) {
    const tags = getTags();
    if (tags.includes(tag)) {
        removeTag(tag);
    } else {
        addTag(tag);
    }
}

function addTag(tag) {
    const currentList = getTags();
    currentList.push(tag);
    callbacks.forEach(callback => callback(currentList));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentList));
}

function removeTag(tag) {
    const currentList = getTags();
    let updatedList = currentList.filter(t => t !== tag);
    callbacks.forEach(callback => callback(updatedList));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
}

function addTagChangedCallback(callback) {
    callbacks.push(callback);
}

function getTags() {
    const storedList = localStorage.getItem(STORAGE_KEY);
    return storedList ? JSON.parse(storedList) : [];
}

function updateFilterTagAppearance(tagList) {
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        const isSelected = tagList.includes(tag.textContent.trim());
        tag.classList.toggle('text-[#ff7f00]', isSelected);
        tag.classList.toggle('font-medium', isSelected);
    });
}

function filter(tagList) {
    const projects = document.querySelectorAll('.project');
    projects.forEach(project => {
        const badges = project.querySelectorAll('.badge');
        const projectTags = Array.from(badges).map(b => b.textContent.trim());
        const hasMatchingTag = tagList.length === 0 || projectTags.length > 0 && tagList.every(tag =>
            projectTags.includes(tag)
        );
        project.style.display = hasMatchingTag ? 'block' : 'none';
    });
    updateFilterTagAppearance(tagList);
}

document.addEventListener('DOMContentLoaded', () => {
    const initialTags = getTags();
    filter(initialTags);
    updateFilterTagAppearance(initialTags);
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => toggleTag(tag.textContent.trim()));
    });
});

addTagChangedCallback(tagList => { filter(tagList); });