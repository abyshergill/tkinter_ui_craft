
        const canvas = document.getElementById('canvas');
        let elementsRegistry = [];
        let selectedElementId = null;
        let draggedItemType = null;
        let snapSize = 10; // Default active snapping matrix

        // --- Keyboard Controls Event ---
        document.addEventListener('keydown', (e) => {
            if (!selectedElementId) return;
            
            // Do not intercept if focus resides inside standard input fields
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
                return;
            }

            const data = elementsRegistry.find(item => item.id === selectedElementId);
            if (!data) return;

            const increment = e.shiftKey ? 10 : 1;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                data.y = Math.max(0, data.y - increment);
                syncElementDOM(data);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                data.y = Math.min(canvas.clientHeight - (data.h || 30), data.y + increment);
                syncElementDOM(data);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                data.x = Math.max(0, data.x - increment);
                syncElementDOM(data);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                data.x = Math.min(canvas.clientWidth - (data.w || 100), data.x + increment);
                syncElementDOM(data);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteCurrentElement();
            }
        });

        // --- Drag and Drop Logic ---
        document.querySelectorAll('.draggable-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItemType = e.target.getAttribute('data-type');
            });
        });

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            
            // Calculate absolute x & y placement offset coordinates
            let x = Math.round(e.clientX - rect.left);
            let y = Math.round(e.clientY - rect.top);
            
            // Snap to matrix during dropped positioning values
            x = Math.round(x / snapSize) * snapSize;
            y = Math.round(y / snapSize) * snapSize;

            spawnWidget(draggedItemType, x, y);
        });

        // --- Set Active Snapping Step ---
        function setSnap(size) {
            snapSize = size;
            document.querySelectorAll('.snap-btn').forEach(btn => {
                btn.className = "snap-btn px-2.5 py-1 text-xs font-semibold rounded text-slate-400 hover:text-white transition-all";
            });
            const activeBtn = document.getElementById(`snap-${size}`);
            activeBtn.className = "snap-btn px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 text-white shadow-sm transition-all";
        }

        function updateWindowSettings() {
            const winW = parseInt(document.getElementById('win-w').value) || 800;
            const winH = parseInt(document.getElementById('win-h').value) || 600;
            const title = document.getElementById('win-title').value || "Generated App Blueprint Layout";
            const bgColor = document.getElementById('win-bg').value;

            document.getElementById('simulated-title').innerText = title;
            document.getElementById('simulated-dimensions').innerText = `${winW} x ${winH}`;
            document.getElementById('win-bg-hex').value = bgColor;

            const frame = document.getElementById('tk-window-frame');
            frame.style.width = winW + 'px';
            frame.style.height = winH + 'px';
            canvas.style.backgroundColor = bgColor;
        }

        function updateWindowHexBg() {
            const hex = document.getElementById('win-bg-hex').value;
            if (/^#[0-9A-F]{6}$/i.test(hex)) {
                document.getElementById('win-bg').value = hex;
                updateWindowSettings();
            }
        }

        // --- Change Tabs in Inspector ---
        function setRightTab(tab) {
            document.getElementById('tab-widget-btn').className = "flex-1 py-3 text-xs font-semibold text-center " + (tab === 'widget' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800');
            document.getElementById('tab-window-btn').className = "flex-1 py-3 text-xs font-semibold text-center " + (tab === 'window' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800');
            
            if (tab === 'widget') {
                document.getElementById('tab-widget').classList.remove('hidden');
                document.getElementById('tab-window').classList.add('hidden');
            } else {
                document.getElementById('tab-widget').classList.add('hidden');
                document.getElementById('tab-window').classList.remove('hidden');
            }
        }

        // --- Spawning Logic ---
        function spawnWidget(type, x, y) {
            // Safe coordinates fallback on central canvas positioning if not drag-dropped
            if (x === undefined || y === undefined) {
                x = Math.round((canvas.clientWidth / 2 - 50) / snapSize) * snapSize;
                y = Math.round((canvas.clientHeight / 2 - 15) / snapSize) * snapSize;
            }

            const id = 'el_' + Date.now() + '_' + Math.floor(Math.random() * 100);
            const index = elementsRegistry.length + 1;
            const varName = `${type.toLowerCase()}_${index}`;
            
            // Set up standard starting parameters based on type chosen
            let defaultText = type;
            let w = 120;
            let h = 32;
            let bg = "#f1f5f9";
            let fg = "#1e293b";
            let fontSize = 11;
            let fontWeight = "normal";
            let bd = 1;
            let relief = "raised";

            if (type === 'Label') {
                bg = "transparent";
                relief = "flat";
                bd = 0;
            } else if (type === 'Entry') {
                bg = "#ffffff";
                defaultText = "";
                relief = "sunken";
            } else if (type === 'Text') {
                bg = "#ffffff";
                w = 200;
                h = 100;
                defaultText = "";
                relief = "sunken";
            } else if (type === 'Checkbutton' || type === 'Radiobutton') {
                bg = "transparent";
                relief = "flat";
                bd = 0;
            } else if (type === 'Listbox') {
                bg = "#ffffff";
                w = 150;
                h = 120;
                defaultText = "";
                relief = "sunken";
            } else if (type === 'Scale') {
                bg = "transparent";
                w = 140;
                h = 45;
                defaultText = "Slider";
                relief = "flat";
                bd = 0;
            } else if (type === 'Progressbar') {
                bg = "#e2e8f0";
                w = 150;
                h = 16;
                defaultText = "";
                relief = "flat";
                bd = 1;
            } else if (type === 'Frame') {
                bg = "transparent";
                w = 200;
                h = 150;
                defaultText = "";
                relief = "groove";
                bd = 2;
            }

            const data = { id, type, x, y, w, h, text: defaultText, bg, fg, fontSize, fontWeight, bd, relief, varName };
            elementsRegistry.push(data);

            const div = document.createElement('div');
            div.id = id;
            div.className = `placed-element tk-${type.toLowerCase()}`;
            
            // Insert customized rendering wrappers per type
            renderInnerMarkup(div, data);

            div.style.left = x + 'px';
            div.style.top = y + 'px';
            div.style.width = w + 'px';
            div.style.height = h + 'px';

            // Click listener for dragging and selection
            div.addEventListener('mousedown', (e) => startMovingElement(e, data));
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                selectElement(id);
            });

            canvas.appendChild(div);
            selectElement(id);
        }

        // --- Render Customized DOM inside visual wrapper ---
        function renderInnerMarkup(div, data) {
            div.innerHTML = '';
            
            // Map individual structural decorators
            if (data.type === 'Button' || data.type === 'Label') {
                div.innerText = data.text;
            } else if (data.type === 'Entry') {
                const input = document.createElement('div');
                input.className = 'w-full h-full bg-white border border-slate-300 rounded px-1 flex items-center text-slate-400 text-xs overflow-hidden select-none';
                input.innerText = data.text || 'Single Input Entry';
                div.appendChild(input);
            } else if (data.type === 'Text') {
                const text = document.createElement('div');
                text.className = 'w-full h-full bg-white border border-slate-300 rounded p-1 text-slate-400 text-[10px] overflow-hidden select-none';
                text.innerText = 'Multi-line Text Area...';
                div.appendChild(text);
            } else if (data.type === 'Checkbutton') {
                div.innerText = data.text;
            } else if (data.type === 'Radiobutton') {
                div.innerText = data.text;
            } else if (data.type === 'Listbox') {
                const box = document.createElement('div');
                box.className = 'w-full h-full bg-white border border-slate-300 rounded p-1 text-xs space-y-1 overflow-hidden';
                box.innerHTML = '<div class="bg-blue-100 px-1 py-0.5 rounded text-blue-800 text-[10px]">Item Node 1</div><div class="px-1 text-slate-600 text-[10px]">Item Node 2</div>';
                div.appendChild(box);
            } else if (data.type === 'Scale') {
                div.innerHTML = `
                    <span class="mb-1 text-[10px] text-slate-500 font-bold">${data.text}</span>
                    <div class="tk-scale-track">
                        <div class="tk-scale-handle"></div>
                    </div>
                `;
            } else if (data.type === 'Progressbar') {
                div.innerHTML = `<div class="tk-progressbar-fill"></div>`;
            } else if (data.type === 'Frame') {
                div.innerHTML = `<div class="absolute top-1 left-2 text-[8px] uppercase tracking-wider text-slate-400 font-bold font-mono">Frame Container</div>`;
            }

            // Apply global variable formatting properties dynamically
            if (data.bg && data.bg !== 'transparent') {
                div.style.backgroundColor = data.bg;
            } else {
                div.style.backgroundColor = '';
            }
            div.style.color = data.fg || '#1e293b';
            div.style.fontSize = (data.fontSize || 11) + 'px';
            div.style.fontWeight = data.fontWeight || 'normal';
            div.style.borderWidth = (data.bd !== undefined ? data.bd : 1) + 'px';
            
            // Set standard simulated Tk border styling
            if (data.relief === 'flat') div.style.borderStyle = 'none';
            else if (data.relief === 'raised') div.style.borderStyle = 'outset';
            else if (data.relief === 'sunken') div.style.borderStyle = 'inset';
            else if (data.relief === 'groove') div.style.borderStyle = 'groove';
            else if (data.relief === 'ridge') div.style.borderStyle = 'ridge';
        }

        // --- Move Item Handler ---
        function startMovingElement(e, data) {
            e.stopPropagation();
            selectElement(data.id);
            const div = document.getElementById(data.id);
            
            const startX = e.clientX - data.x;
            const startY = e.clientY - data.y;
            
            function mouseMoveHandler(moveEvent) {
                let newX = moveEvent.clientX - startX;
                let newY = moveEvent.clientY - startY;
                
                // Keep dimensions within canvas area
                newX = Math.max(0, Math.min(newX, canvas.clientWidth - div.offsetWidth));
                newY = Math.max(0, Math.min(newY, canvas.clientHeight - div.offsetHeight));
                
                // Snap coordinates placement to active matrix step value
                data.x = Math.round(newX / snapSize) * snapSize;
                data.y = Math.round(newY / snapSize) * snapSize;
                
                syncElementDOM(data);
            }
            
            function mouseUpHandler() {
                window.removeEventListener('mousemove', mouseMoveHandler);
                window.removeEventListener('mouseup', mouseUpHandler);
            }
            
            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', mouseUpHandler);
        }

        // --- Select and Properties Panel Setup ---
        function selectElement(id) {
            selectedElementId = id;
            document.querySelectorAll('.placed-element').forEach(el => {
                el.classList.remove('selected');
                const handle = el.querySelector('.resize-handle');
                if (handle) handle.remove();
            });
            
            const el = document.getElementById(id);
            if (!el) return;

            el.classList.add('selected');
            
            // Add Resizing Corner Handle
            const handle = document.createElement('div');
            handle.className = 'resize-handle';
            handle.addEventListener('mousedown', (e) => startResizingElement(e, id));
            el.appendChild(handle);

            const data = elementsRegistry.find(item => item.id === id);
            if (data) {
                document.getElementById('no-selection-msg').style.display = 'none';
                document.getElementById('editor-fields').style.display = 'flex';
                
                document.getElementById('prop-id').value = data.id;
                document.getElementById('prop-var').value = data.varName;
                document.getElementById('prop-text').value = data.text;
                document.getElementById('prop-x').value = data.x;
                document.getElementById('prop-y').value = data.y;
                document.getElementById('prop-w').value = data.w;
                document.getElementById('prop-h').value = data.h;
                
                const currentBg = data.bg === 'transparent' ? '#ffffff' : data.bg;
                document.getElementById('prop-bg').value = currentBg;
                document.getElementById('prop-bg-hex').value = data.bg;
                
                document.getElementById('prop-fg').value = data.fg;
                document.getElementById('prop-fg-hex').value = data.fg;
                
                document.getElementById('prop-font-size').value = data.fontSize;
                document.getElementById('prop-font-weight').value = data.fontWeight;
                document.getElementById('prop-relief').value = data.relief;
                document.getElementById('prop-bd').value = data.bd;

                // Set Right sidebar tab to Widget props automatically
                setRightTab('widget');
            }
        }

        // Deselect item if clicking on blank space of canvas
        canvas.addEventListener('click', () => {
            selectedElementId = null;
            document.querySelectorAll('.placed-element').forEach(el => {
                el.classList.remove('selected');
                const handle = el.querySelector('.resize-handle');
                if (handle) handle.remove();
            });
            document.getElementById('no-selection-msg').style.display = 'block';
            document.getElementById('editor-fields').style.display = 'none';
        });

        // --- Handle Resizing Event ---
        function startResizingElement(e, id) {
            e.stopPropagation();
            e.preventDefault();
            const data = elementsRegistry.find(item => item.id === id);
            
            const startWidth = data.w;
            const startHeight = data.h;
            const startX = e.clientX;
            const startY = e.clientY;

            function mouseMoveHandler(moveEvent) {
                let deltaX = moveEvent.clientX - startX;
                let deltaY = moveEvent.clientY - startY;

                let newW = startWidth + deltaX;
                let newH = startHeight + deltaY;

                // Align resizing values to snap bounds
                newW = Math.round(newW / snapSize) * snapSize;
                newH = Math.round(newH / snapSize) * snapSize;

                data.w = Math.max(20, newW);
                data.h = Math.max(15, newH);

                syncElementDOM(data);
            }

            function mouseUpHandler() {
                window.removeEventListener('mousemove', mouseMoveHandler);
                window.removeEventListener('mouseup', mouseUpHandler);
            }

            window.addEventListener('mousemove', mouseMoveHandler);
            window.addEventListener('mouseup', mouseUpHandler);
        }

        // --- Sync Element Model changes to DOM and properties inputs ---
        function syncElementDOM(data) {
            const div = document.getElementById(data.id);
            if (!div) return;

            div.style.left = data.x + 'px';
            div.style.top = data.y + 'px';
            div.style.width = data.w + 'px';
            div.style.height = data.h + 'px';

            renderInnerMarkup(div, data);

            // Keep selected handle active inside DOM wrapper
            if (selectedElementId === data.id && !div.querySelector('.resize-handle')) {
                const handle = document.createElement('div');
                handle.className = 'resize-handle';
                handle.addEventListener('mousedown', (e) => startResizingElement(e, data.id));
                div.appendChild(handle);
            }

            // Sync property inputs if currently active selection matches
            if (selectedElementId === data.id) {
                document.getElementById('prop-var').value = data.varName;
                document.getElementById('prop-text').value = data.text;
                document.getElementById('prop-x').value = data.x;
                document.getElementById('prop-y').value = data.y;
                document.getElementById('prop-w').value = data.w;
                document.getElementById('prop-h').value = data.h;
            }
        }

        // --- Update parameters from Properties sidebar inputs ---
        function updateCurrentElement() {
            if (!selectedElementId) return;
            const data = elementsRegistry.find(item => item.id === selectedElementId);
            if (!data) return;

            data.varName = document.getElementById('prop-var').value.trim().replace(/[^a-zA-Z0-9_]/g, '');
            data.text = document.getElementById('prop-text').value;
            data.x = parseInt(document.getElementById('prop-x').value) || 0;
            data.y = parseInt(document.getElementById('prop-y').value) || 0;
            data.w = parseInt(document.getElementById('prop-w').value) || 20;
            data.h = parseInt(document.getElementById('prop-h').value) || 15;
            data.bg = document.getElementById('prop-bg-hex').value;
            data.fg = document.getElementById('prop-fg-hex').value;
            data.fontSize = parseInt(document.getElementById('prop-font-size').value) || 11;
            data.fontWeight = document.getElementById('prop-font-weight').value;
            data.relief = document.getElementById('prop-relief').value;
            data.bd = parseInt(document.getElementById('prop-bd').value) || 0;

            syncElementDOM(data);
        }

        function updateHexColor(type) {
            const hexInput = document.getElementById(`prop-${type}-hex`).value;
            if (/^#[0-9A-F]{6}$/i.test(hexInput) || hexInput === 'transparent') {
                if (hexInput !== 'transparent') {
                    document.getElementById(`prop-${type}`).value = hexInput;
                }
                updateCurrentElement();
            }
        }

        // Color input changes update hex input
        document.getElementById('prop-bg').addEventListener('input', (e) => {
            document.getElementById('prop-bg-hex').value = e.target.value;
            updateCurrentElement();
        });
        document.getElementById('prop-fg').addEventListener('input', (e) => {
            document.getElementById('prop-fg-hex').value = e.target.value;
            updateCurrentElement();
        });

        // --- Delete Selected Widget ---
        function deleteCurrentElement() {
            if (!selectedElementId) return;
            const index = elementsRegistry.findIndex(item => item.id === selectedElementId);
            if (index !== -1) {
                elementsRegistry.splice(index, 1);
                document.getElementById(selectedElementId).remove();
                selectedElementId = null;
                
                document.getElementById('no-selection-msg').style.display = 'block';
                document.getElementById('editor-fields').style.display = 'none';
            }
        }

        // --- Duplicate Widget ---
        function duplicateCurrentElement() {
            if (!selectedElementId) return;
            const source = elementsRegistry.find(item => item.id === selectedElementId);
            if (!source) return;

            const offset = 20;
            const newX = Math.min(canvas.clientWidth - source.w, source.x + offset);
            const newY = Math.min(canvas.clientHeight - source.h, source.y + offset);

            spawnWidget(source.type, newX, newY);
            
            // Sync cloned attributes from source metadata
            const clone = elementsRegistry[elementsRegistry.length - 1];
            clone.w = source.w;
            clone.h = source.h;
            clone.text = source.text;
            clone.bg = source.bg;
            clone.fg = source.fg;
            clone.fontSize = source.fontSize;
            clone.fontWeight = source.fontWeight;
            clone.relief = source.relief;
            clone.bd = source.bd;

            syncElementDOM(clone);
            selectElement(clone.id);
        }

        // --- Wipe Whole Canvas clean ---
        function clearCanvas() {
            elementsRegistry = [];
            canvas.innerHTML = '';
            selectedElementId = null;
            document.getElementById('no-selection-msg').style.display = 'block';
            document.getElementById('editor-fields').style.display = 'none';
        }

        // --- Generate Python Code String Output ---
        function assemblePythonCode() {
            const winTitle = document.getElementById('win-title').value || "Generated App Blueprint Layout";
            const winW = parseInt(document.getElementById('win-w').value) || 800;
            const winH = parseInt(document.getElementById('win-h').value) || 600;
            const winBg = document.getElementById('win-bg').value || "#f8fafc";
            const isResizable = document.getElementById('win-resizable').checked;
            const exportType = document.getElementById('win-export-type').value;

            // Detect imports needed (ttk module required for progressbar)
            const hasTTK = elementsRegistry.some(el => el.type === 'Progressbar');

            let code = `import tkinter as tk\n`;
            if (hasTTK) {
                code += `from tkinter import ttk\n`;
            }

            if (exportType === 'class') {
                code += `\nclass App:\n`;
                code += `    def __init__(self, root):\n`;
                code += `        # setting title\n`;
                code += `        root.title("${winTitle}")\n`;
                code += `        # setting window size\n`;
                code += `        width = ${winW}\n`;
                code += `        height = ${winH}\n`;
                code += `        screenwidth = root.winfo_screenwidth()\n`;
                code += `        screenheight = root.winfo_screenheight()\n`;
                code += `        alignstr = '%dx%d+%d+%d' % (width, height, (screenwidth - width) / 2, (screenheight - height) / 2)\n`;
                code += `        root.geometry(alignstr)\n`;
                code += `        root.resizable(width=${isResizable ? 'True' : 'False'}, height=${isResizable ? 'True' : 'False'})\n`;
                code += `        root.configure(bg="${winBg}")\n\n`;

                if (elementsRegistry.length === 0) {
                    code += `        pass\n`;
                }

                elementsRegistry.forEach(el => {
                    code += `        # Widget: ${el.varName}\n`;
                    code += generateWidgetInstanciation(el, 'self.', 'root', '        ');
                    code += `        self.${el.varName}.place(x=${el.x}, y=${el.y}, width=${el.w}, height=${el.h})\n\n`;
                });

                code += `\nif __name__ == "__main__":\n`;
                code += `    root = tk.Tk()\n`;
                code += `    app = App(root)\n`;
                code += `    root.mainloop()\n`;
            } else {
                code += `\n# Initialize central root window context\n`;
                code += `root = tk.Tk()\n`;
                code += `root.title("${winTitle}")\n`;
                code += `root.geometry("${winW}x${winH}")\n`;
                code += `root.configure(bg="${winBg}")\n`;
                code += `root.resizable(width=${isResizable ? 'True' : 'False'}, height=${isResizable ? 'True' : 'False'})\n\n`;

                elementsRegistry.forEach(el => {
                    code += `# Widget: ${el.varName}\n`;
                    code += generateWidgetInstanciation(el, '', 'root', '');
                    code += `${el.varName}.place(x=${el.x}, y=${el.y}, width=${el.w}, height=${el.h})\n\n`;
                });

                code += `root.mainloop()\n`;
            }

            return code;
        }

        // --- Inner helper mapping Tk constructor details ---
        function generateWidgetInstanciation(el, varPrefix, parentVar, indent) {
            const fontStr = `font=("Arial", ${el.fontSize}, "${el.fontWeight}")`;
            const bgStr = el.bg === 'transparent' ? '' : `, bg="${el.bg}"`;
            const fgStr = `, fg="${el.fg}"`;
            const bdStr = `, bd=${el.bd}`;
            const reliefStr = `, relief="${el.relief}"`;

            let inst = "";
            const v = `${varPrefix}${el.varName}`;

            if (el.type === 'Button') {
                inst = `${indent}${v} = tk.Button(${parentVar}, text="${el.text}"${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Label') {
                inst = `${indent}${v} = tk.Label(${parentVar}, text="${el.text}"${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Entry') {
                inst = `${indent}${v} = tk.Entry(${parentVar}${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Text') {
                inst = `${indent}${v} = tk.Text(${parentVar}${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Checkbutton') {
                inst = `${indent}${v} = tk.Checkbutton(${parentVar}, text="${el.text}"${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Radiobutton') {
                inst = `${indent}${v} = tk.Radiobutton(${parentVar}, text="${el.text}"${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Listbox') {
                inst = `${indent}${v} = tk.Listbox(${parentVar}${bgStr}${fgStr}, ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Scale') {
                inst = `${indent}${v} = tk.Scale(${parentVar}, label="${el.text}"${bgStr}${fgStr}, orient="horizontal", ${fontStr}${bdStr}${reliefStr})\n`;
            } else if (el.type === 'Progressbar') {
                // TTK widgets do not accept standard font/bg overrides
                inst = `${indent}${v} = ttk.Progressbar(${parentVar}, orient="horizontal", mode="determinate")\n`;
            } else if (el.type === 'Frame') {
                inst = `${indent}${v} = tk.Frame(${parentVar}, bg="${el.bg}"${bdStr}${reliefStr})\n`;
            }

            return inst;
        }

        // --- Trigger Save File Download ---
        function exportPythonCode() {
            const scriptContent = assemblePythonCode();
            const blob = new Blob([scriptContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = url;
            downloadAnchor.download = 'tkinter_ui_blueprint.py';
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(url);
        }

        // --- Modal Control Functions ---
        function openPreviewModal() {
            const code = assemblePythonCode();
            document.getElementById('python-preview-code').innerText = code;
            document.getElementById('preview-modal').classList.remove('hidden');
        }

        function closePreviewModal() {
            document.getElementById('preview-modal').classList.add('hidden');
        }

        function copyToClipboard() {
            const codeText = document.getElementById('python-preview-code').innerText;
            
            // Modern copy handling supporting Canvas isolated runtime conditions
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = codeText;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
        }
