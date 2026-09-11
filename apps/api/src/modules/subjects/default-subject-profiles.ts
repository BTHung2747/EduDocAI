export type DefaultSubjectProfile = {
  name: string;
  description: string;
};

export const DEFAULT_SUBJECT_PROFILES: DefaultSubjectProfile[] = [
  { name: 'Mạng máy tính', description: 'TCP/IP, mô hình OSI, IPv4, IPv6, subnet, router, switch, routing, OSPF, BGP, VLAN, DNS, DHCP, LAN, WAN.' },
  { name: 'Cơ sở dữ liệu', description: 'SQL, PostgreSQL, MySQL, SQL Server, bảng, quan hệ, khóa chính, khóa ngoại, index, transaction, normalization, truy vấn, stored procedure.' },
  { name: 'Lập trình Web', description: 'HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, REST API, HTTP, frontend, backend, web server.' },
  { name: 'Lập trình hướng đối tượng', description: 'class, object, inheritance, encapsulation, polymorphism, abstraction, interface, Java, C++, C#.' },
  { name: 'Cấu trúc dữ liệu và giải thuật', description: 'array, linked list, stack, queue, tree, graph, sorting, searching, recursion, complexity, Big O.' },
  { name: 'Hệ điều hành', description: 'process, thread, CPU scheduling, memory management, virtual memory, file system, deadlock, synchronization.' },
  { name: 'An toàn thông tin', description: 'cybersecurity, encryption, authentication, authorization, firewall, malware, vulnerability, network security, cryptography, access control.' },
  { name: 'Công nghệ phần mềm', description: 'software development lifecycle, requirements, UML, testing, Agile, Scrum, design pattern, maintenance, software architecture.' },
  { name: 'Trí tuệ nhân tạo', description: 'artificial intelligence, machine learning, neural network, deep learning, classification, regression, NLP, computer vision, model training.' },
  { name: 'Kiến trúc máy tính', description: 'CPU, instruction, register, cache, memory, assembly, input output, processor, computer organization.' },
  { name: 'Toán rời rạc', description: 'logic, tập hợp, quan hệ, đồ thị, tổ hợp, xác suất, mệnh đề, boolean, cây, phép đếm.' },
  { name: 'Điện toán đám mây', description: 'cloud computing, virtual machine, container, distributed system, AWS, Azure, Google Cloud, serverless, storage, deployment.' },
];
