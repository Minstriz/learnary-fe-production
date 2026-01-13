import * as XLSX from 'xlsx';

type Option = { option_content: string; is_correct: boolean; };
type Question = { title: string; options: Option[]; };
type Quiz = { title: string; questions: Question[]; };

/**
 * Parse dữ liệu từ file Excel thành Quiz structure
 * Format Excel:
 * Column A: Nội dung câu hỏi/đáp án
 * Column B: 1 (nếu là đáp án đúng) hoặc để trống
 * 
 * Câu hỏi đầu tiên trong mỗi nhóm là tiêu đề câu hỏi
 * Các dòng tiếp theo là các lựa chọn
 * Các nhóm câu hỏi cách nhau 1 dòng trống
 */
/* ĐÃ LƯU TÀI LIỆU THAM KHẢO AI */
export function parseExcelToQuiz(file: File): Promise<Question[]> {
    /*
    Promise là một object đại diện cho kết quả của một thao tác bất đồng bộ (asynchronous)
    Nó có 3 trạng thái:
        Pending: Đang xử lý
        Fulfilled: Thành công (gọi resolve)
        Rejected: Thất bại (gọi reject) 
     // resolve: hàm gọi khi thành công
    // reject: hàm gọi khi thất bại
     */
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert sheet to array of arrays
                const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1, // Không parse header tự động
                    defval: undefined, // Giá trị mặc định cho ô trống
                    blankrows: true // Giữ lại các dòng trống để phân tách câu hỏi
                });
                /* 
                    [
                        ['Nội dung', 'Đáp án đúng'],           // Dòng 0: Header
                        ['Python là gì?', ''],                  // Dòng 1: Câu hỏi
                        ['Ngôn ngữ bậc cao', '1'],             // Dòng 2: Đáp án đúng
                        ['Ngôn ngữ bậc thấp', ''],             // Dòng 3: Đáp án sai
                        [],                                     // Dòng 4: Dòng trống (phân cách)
                        ['Câu lệnh in?', ''],                  // Dòng 5: Câu hỏi mới
                        // ...
                    ]
                 */
                const questions: Question[] = [];
                let currentQuestion: Question | null = null;

                for (let i = 0; i < rows.length; i++) {
                    // Skip dòng header (dòng đầu tiên)
                    if (i === 0) continue;
                    const row = rows[i];
                    const content = row[0]?.toString().trim();
                    const isCorrect = row[1] === 1 || row[1] === '1';

                    // Dòng trống (không có nội dung ở cột đầu tiên) - kết thúc câu hỏi hiện tại
                    if (!content || content === '') {
                        if (currentQuestion && currentQuestion.options.length > 0) {
                            questions.push(currentQuestion);
                            currentQuestion = null;
                        }
                        continue;
                    }

                    // Nếu chưa có câu hỏi nào đang xử lý, dòng này là tiêu đề câu hỏi mới
                    if (!currentQuestion) {
                        currentQuestion = {
                            title: content,
                            options: []
                        };
                    } else {
                        // Dòng này là một lựa chọn của câu hỏi hiện tại
                        currentQuestion.options.push({
                            option_content: content,
                            is_correct: isCorrect
                        });
                    }
                }

                // Thêm câu hỏi cuối cùng nếu có
                if (currentQuestion && currentQuestion.options.length > 0) {
                    questions.push(currentQuestion);
                }

                // Validate: mỗi câu hỏi phải có ít nhất 1 đáp án đúng
                const invalidQuestions = questions.filter(q =>
                    !q.options.some(o => o.is_correct) || q.options.length < 2
                );

                if (invalidQuestions.length > 0) {
                    reject(new Error(`Có ${invalidQuestions.length} câu hỏi không hợp lệ (thiếu đáp án đúng hoặc ít hơn 2 lựa chọn)`));
                    return;
                }

                resolve(questions);
            } catch {
                reject(new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'));
            }
        };

        reader.onerror = () => reject(new Error('Lỗi khi đọc file'));
        reader.readAsBinaryString(file);
    });
}

/**
 * Tạo file Excel mẫu để người dùng download
 */
export function downloadQuizTemplate() {
    // Tạo dữ liệu mẫu
    const sampleData = [
        ['Nội dung (Câu hỏi/Đáp án)', 'Đáp án đúng (1 hoặc để trống)'],
        ['Python là ngôn ngữ lập trình gì?', ''],
        ['Ngôn ngữ bậc cao', '1'],
        ['Ngôn ngữ bậc thấp', ''],
        ['Ngôn ngữ máy', ''],
        ['Ngôn ngữ hợp ngữ', ''],
        [], // Dòng trống phân cách
        ['Câu lệnh nào dùng để in ra màn hình trong Python?', ''],
        ['console.log()', ''],
        ['print()', '1'],
        ['System.out.println()', ''],
        ['cout', ''],
        [], // Dòng trống phân cách
        ['Kiểu dữ liệu nào lưu trữ số nguyên trong Python?', ''],
        ['string', ''],
        ['int', '1'],
        ['float', ''],
        ['boolean', ''],
    ];

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Set độ rộng cột
    ws['!cols'] = [
        { wch: 50 }, // Column A
        { wch: 30 }  // Column B
    ];

    // Add worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');

    // Download file
    XLSX.writeFile(wb, 'quiz-template.xlsx');
}

/**
 * Export quiz hiện tại ra file Excel
 */
export function exportQuizToExcel(quiz: Quiz) {
    const data: (string | number)[][] = [
        ['Nội dung (Câu hỏi/Đáp án)', 'Đáp án đúng (1 hoặc để trống)']
    ];

    quiz.questions.forEach((question, index) => {
        // Thêm tiêu đề câu hỏi
        data.push([question.title, '']);

        // Thêm các lựa chọn
        question.options.forEach(option => {
            data.push([option.option_content, option.is_correct ? 1 : '']);
        });

        // Thêm dòng trống phân cách (trừ câu hỏi cuối)
        if (index < quiz.questions.length - 1) {
            data.push([]);
        }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
        { wch: 50 },
        { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Quiz');

    const fileName = `${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
